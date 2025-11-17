import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaStickyNote
} from 'react-icons/fa'
import { Button, Input, LoadingSpinner } from '../index'
import { useTheme } from '../../contexts/ThemeContext'
import { appointmentsAPI } from '../../services/api'
import { authUtils } from '../../utils/auth'

const NewAppointmentModal = ({ isOpen, onClose, onSave, preselectedPatient = null }) => {
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
      
      if (!user || !user.id) {
        console.error('User not authenticated')
        return
      }

      const response = await appointmentsAPI.getAvailableSlots(user.id, date)
      
      // Generate time slots based on working hours
      const slots = generateTimeSlotsFromWorkingHours(
        response.workingHours,
        response.appointmentDuration || 30
      )
      
      // Mark booked slots - check for overlaps with existing appointments
      const booked = []
      const duration = response.appointmentDuration || 30
      
      slots.forEach(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number)
        const slotStart = new Date(date)
        slotStart.setHours(slotHour, slotMinute, 0, 0)
        const slotEnd = new Date(slotStart.getTime() + duration * 60000)
        
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
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

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

        // Get clinicId from user's dentist profile
        const clinicId = user.dentist?.clinicId || user.clinicId
        
        if (!clinicId) {
          setErrors({ general: 'Clinic information is missing. Please contact support.' })
          setLoading(false)
          return
        }
        
        // Construct appointment data
        const startDateTime = new Date(`${formData.date}T${formData.time}`)
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000) // 30 minutes duration
        
        const appointmentData = {
          patientId: preselectedPatient.id,
          dentistId: user.id,
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

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-4xl transform transition-all ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Book an Appointment
              </h2>
              {preselectedPatient && (
                <p className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  for {preselectedPatient.name}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
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
                    min={new Date().toISOString().split('T')[0]}
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
                                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
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
                        <div className="w-4 h-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded"></div>
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
        </div>
      </div>
    </div>,
    document.body
  )
}

export default NewAppointmentModal
