import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaStickyNote
} from 'react-icons/fa'
import { Button, Input, LoadingSpinner, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { appointmentsAPI } from '../../../services/api'
import { authUtils } from '../../../utils/auth'
import { convertTo12Hour, addMinutes, getTodayISO } from '../../../utils/helpers'

const NewAppointmentModal = ({ isOpen, onClose, onSave, preselectedPatient = null, preselectedDentist = null }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    sessionNotes: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [appointmentDuration, setAppointmentDuration] = useState(30) // Default 30 minutes

  // Fetch available slots when date is selected
  useEffect(() => {
    if (isOpen && formData.date) {
      fetchAvailableSlots(formData.date)
    }
  }, [formData.date, isOpen])

  const fetchAvailableSlots = async (date) => {
    try {
      setLoadingSlots(true)
      const user = authUtils.getCurrentUser()
      
      // Use preselected dentist if available (for secretary), otherwise use current user (for dentist)
      const dentistId = preselectedDentist?.id || user?.id
      
      if (!dentistId) {
        console.error('Dentist ID not available')
        return
      }

      const response = await appointmentsAPI.getAvailableSlots(dentistId, date)
      
      // Store the dentist's appointment duration
      const duration = response.appointmentDuration || 30
      setAppointmentDuration(duration)
      
      // Generate time slots based on working hours
      const slots = generateTimeSlotsFromWorkingHours(
        response.workingHours,
        duration
      )
      
      // Mark booked slots - check for overlaps with existing appointments
      const booked = []
      
      slots.forEach(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number)
        const slotStart = new Date(date)
        slotStart.setHours(slotHour, slotMinute, 0, 0)
        const slotEnd = addMinutes(slotStart, duration)
        
        // Check if this slot overlaps with any existing appointment
        const hasOverlap = response.appointments.some(apt => {
          const aptStart = new Date(apt.startTime)
          const aptEnd = new Date(apt.endTime)
          
          // Check for overlap: slot overlaps if it starts before apt ends AND ends after apt starts
          return slotStart < aptEnd && slotEnd > aptStart
        })
        
        if (hasOverlap) {
          booked.push(slot)
        }
      })
      
      setAvailableSlots(slots)
      setBookedSlots(booked)
    } catch (err) {
      console.error('Error fetching available slots:', err)
      setAvailableSlots([])
      setBookedSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const generateTimeSlotsFromWorkingHours = (workingHours, duration = 30) => {
    if (!workingHours || !workingHours.isWorking) {
      return []
    }

    const slots = []
    const [startHour, startMinute] = workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.end.split(':').map(Number)
    
    // Convert end time to minutes for easier comparison
    const endTimeInMinutes = endHour * 60 + endMinute
    
    let currentHour = startHour
    let currentMinute = startMinute

    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // Calculate appointment end time
      const slotStartInMinutes = currentHour * 60 + currentMinute
      const slotEndInMinutes = slotStartInMinutes + duration
      
      // Check if appointment fits within working hours
      if (slotEndInMinutes > endTimeInMinutes) {
        // Appointment would extend beyond working hours, stop generating slots
        break
      }
      
      // Check if this slot is during a break
      let isDuringBreak = false
      let breakEndTime = null
      if (workingHours.breaks && Array.isArray(workingHours.breaks)) {
        for (const breakPeriod of workingHours.breaks) {
          const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number)
          const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number)
          
          const slotMinutes = currentHour * 60 + currentMinute
          const breakStartMinutes = breakStartHour * 60 + breakStartMinute
          const breakEndMinutes = breakEndHour * 60 + breakEndMinute
          
          // Slot is during break if it's >= break start AND < break end
          if (slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes) {
            isDuringBreak = true
            breakEndTime = { hour: breakEndHour, minute: breakEndMinute }
            break
          }
        }
      }
      
      if (isDuringBreak && breakEndTime) {
        // Skip to the end of the break
        currentHour = breakEndTime.hour
        currentMinute = breakEndTime.minute
        continue
      }
      
      if (!isDuringBreak) {
        slots.push(timeSlot)
      }
      
      // Increment by duration
      currentMinute += duration
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60)
        currentMinute = currentMinute % 60
      }
    }

    return slots
  }

  // Convert 24-hour time to 12-hour format
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Validate date/time combination when date or time changes
    if (name === 'date' || name === 'time') {
      const currentDate = name === 'date' ? value : formData.date
      const currentTime = name === 'time' ? value : formData.time
      
      if (currentDate && currentTime) {
        const appointmentDateTime = new Date(`${currentDate}T${currentTime}`)
        const now = new Date()
        
        if (appointmentDateTime <= now) {
          setErrors(prev => ({
            ...prev,
            time: 'Appointment must be scheduled for a future time'
          }))
        }
      }
    }
  }

  const handleTimeSelect = (time) => {
    // Check if the selected time is in the future
    if (formData.date) {
      const appointmentDateTime = new Date(`${formData.date}T${time}`)
      const now = new Date()
      
      if (appointmentDateTime <= now) {
        setErrors(prev => ({
          ...prev,
          time: 'Appointment must be scheduled for a future time'
        }))
        return
      }
    }
    
    // Clear time error and set the time
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.time
      return newErrors
    })
    
    setFormData(prev => ({ ...prev, time }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else if (formData.date && formData.time) {
      // Validate that the appointment is in the future
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}`)
      const now = new Date()
      
      if (appointmentDateTime <= now) {
        newErrors.time = 'Appointment must be scheduled for a future time'
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      try {
        setLoading(true)
        const user = authUtils.getCurrentUser()
        
        if (!user || !user.id) {
          setErrors({ general: 'User not authenticated. Please login again.' })
          setLoading(false)
          return
        }

        if (!preselectedPatient || !preselectedPatient.id) {
          setErrors({ general: 'Patient information is missing.' })
          setLoading(false)
          return
        }

        // Get clinicId from preselected dentist (for secretary) or user's dentist profile
        const clinicId = preselectedDentist?.clinicId || user.dentist?.clinicId || user.clinicId
        
        if (!clinicId) {
          setErrors({ general: 'Clinic information is missing. Please contact support.' })
          setLoading(false)
          return
        }
        
        // Construct appointment data
        const startDateTime = new Date(`${formData.date}T${formData.time}`)
        const endDateTime = addMinutes(startDateTime, appointmentDuration) // Use dentist's appointment duration
        
        // Use preselected dentist if available (for secretary), otherwise use current user (for dentist)
        const dentistId = preselectedDentist?.id || user.id
        
        const appointmentData = {
          patientId: preselectedPatient.id,
          dentistId: dentistId,
          clinicId: clinicId,
          appointmentDate: formData.date,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          sessionNotes: formData.sessionNotes || '',
          treatmentId: preselectedPatient.treatmentId || null
        }

        console.log('Submitting appointment data:', appointmentData)
        await onSave(appointmentData)
        handleClose()
      } catch (err) {
        console.error('Error submitting appointment:', err)
        const errorMessage = err.response?.data?.error || err.message || 'Failed to book appointment. Please try again.'
        setErrors({ general: errorMessage })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleClose = () => {
    setFormData({
      date: '',
      time: '',
      sessionNotes: ''
    })
    setErrors({})
    setAvailableSlots([])
    setBookedSlots([])
    onClose()
  }

  return createPortal(
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      title={
        <div>
          <div className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Book an Appointment
          </div>
          {preselectedPatient && (
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              for {preselectedPatient.name}
              {preselectedDentist && ` with ${preselectedDentist.name}`}
            </p>
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Select Date, Time & Treatment
                </h3>

                {/* Error Message */}
                {errors.general && (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500">
                    <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaCalendarAlt className="inline mr-2" />
                    Appointment Date
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={getTodayISO()}
                    error={errors.date}
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaClock className="inline mr-2" />
                    Appointment Time
                  </label>
                  
                  {!formData.date ? (
                    <p className={`text-sm italic ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Please select a date first
                    </p>
                  ) : loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No available time slots for this date. You may not be working on this day.
                    </p>
                  ) : (
                    <div className={`grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg ${
                      isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      {availableSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time)
                        
                        const isPastTime = (() => {
                          const appointmentDateTime = new Date(`${formData.date}T${time}`)
                          const now = new Date()
                          return appointmentDateTime <= now
                        })()

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => !isBooked && !isPastTime && handleTimeSelect(time)}
                            disabled={isPastTime || isBooked}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              isPastTime
                                ? isDarkMode
                                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
                                : isBooked
                                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-2 border-red-500 cursor-not-allowed'
                                  : formData.time === time
                                    ? 'bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                                    : isDarkMode
                                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {convertTo12Hour(time)}
                            {isBooked && (
                              <div className="text-xs mt-1">Booked</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Legend */}
                  {formData.date && availableSlots.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-linear-to-r from-teal-600 to-cyan-600 rounded"></div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 border-red-500 ${
                          isDarkMode ? 'bg-red-500/20' : 'bg-red-500/20'
                        }`}></div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${
                          isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
                        }`}></div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Available</span>
                      </div>
                    </div>
                  )}
                  
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-2">{errors.time}</p>
                  )}
                </div>

                {/* Session Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaStickyNote className="inline mr-2" />
                    Session Notes (Optional)
                  </label>
                  <textarea
                    name="sessionNotes"
                    value={formData.sessionNotes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Your notes about the planned session (treatment details, observations, etc.)..."
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!formData.date || !formData.time || loading}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>
          </form>
    </BaseModal>,
    document.body
  )
}

export default NewAppointmentModal
