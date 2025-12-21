import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaStickyNote,
  FaMapMarkerAlt,
  FaBuilding
} from 'react-icons/fa'
import { Button, Input, Card, LoadingSpinner, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { clinicsAPI, appointmentsAPI } from '../../../services/api'
import { authUtils } from '../../../utils/auth'
import { TREATMENT_OPTIONS } from '../../../utils/constants'
import { convertTo12Hour, addMinutes, getTodayISO } from '../../../utils/helpers'

const BookAppointmentModal = ({ isOpen, onClose, onSave, preselectedDoctor = null }) => {
  const { isDarkMode } = useTheme()
  const [step, setStep] = useState(1) // 1: Select Clinic, 2: Select Dentist, 3: Select Date/Time, 4: Confirm
  const [formData, setFormData] = useState({
    clinicId: '',
    dentistId: '',
    date: '',
    time: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [clinics, setClinics] = useState([])
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [appointmentDuration, setAppointmentDuration] = useState(30) // Default 30 minutes

  // Initialize with preselected doctor if provided
  useEffect(() => {
    if (isOpen && preselectedDoctor) {
      const clinicId = preselectedDoctor.clinic?.userId?.toString() || preselectedDoctor.clinicId?.toString() || ''
      const dentistId = preselectedDoctor.userId?.toString() || preselectedDoctor.id?.toString() || ''
      
      setFormData(prev => ({
        ...prev,
        clinicId: clinicId,
        dentistId: dentistId
      }))
      
      // If we have both clinic and dentist, go to step 1 (date/time)
      if (clinicId && dentistId) {
        setStep(1)
        
        // Set the clinic and dentist in state
        if (preselectedDoctor.clinic) {
          setClinics([preselectedDoctor.clinic])
        }
        setDentists([preselectedDoctor])
      }
    } else if (isOpen && !preselectedDoctor) {
      // Reset to actual step 1 (select clinic) if no preselection
      setStep(1)
    }
  }, [isOpen, preselectedDoctor])

  // Fetch clinics when modal opens
  useEffect(() => {
    if (isOpen && !preselectedDoctor) {
      fetchClinics()
    }
  }, [isOpen, preselectedDoctor])

  // Fetch dentists when clinic is selected
  useEffect(() => {
    if (formData.clinicId) {
      fetchDentistsByClinic(formData.clinicId)
    }
  }, [formData.clinicId])

  // Fetch available slots when dentist and date are selected
  useEffect(() => {
    if (isOpen && formData.dentistId && formData.date) {
      fetchAvailableSlots(formData.dentistId, formData.date)
    }
  }, [formData.dentistId, formData.date, isOpen])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await clinicsAPI.getAll()
      setClinics(response.data || [])
    } catch (err) {
      console.error('Error fetching clinics:', err)
      setError('Failed to load clinics')
    } finally {
      setLoading(false)
    }
  }

  const fetchDentistsByClinic = async (clinicId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await appointmentsAPI.getDentistsByClinic(clinicId)
      setDentists(response.dentists || [])
    } catch (err) {
      console.error('Error fetching dentists:', err)
      setError('Failed to load dentists')
      setDentists([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async (dentistId, date) => {
    try {
      setLoadingSlots(true)
      setError(null)
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
      setError('Failed to load available time slots')
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

  const treatmentOptions = TREATMENT_OPTIONS

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

  const handleClinicSelect = (clinicId) => {
    setFormData(prev => ({
      ...prev,
      clinicId: clinicId.toString(),
      dentistId: '' // Reset dentist when clinic changes
    }))
    setStep(2)
  }

  const handleDentistSelect = (dentistId) => {
    setFormData(prev => ({
      ...prev,
      dentistId: dentistId.toString()
    }))
    setStep(3)
  }

  const validateStep = () => {
    const newErrors = {}

    // When preselected doctor exists, step 1 is date/time, step 2 is confirmation
    // When no preselected doctor, step 1 is clinic, step 2 is dentist, step 3 is date/time, step 4 is confirmation
    
    if (!preselectedDoctor) {
      if (step === 1 && !formData.clinicId) {
        newErrors.clinicId = 'Please select a clinic'
      }

      if (step === 2 && !formData.dentistId) {
        newErrors.dentistId = 'Please select a dentist'
      }
    }

    // Date/Time validation: step 1 for preselected, step 3 for normal flow
    if ((preselectedDoctor && step === 1) || (!preselectedDoctor && step === 3)) {
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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      const maxStep = preselectedDoctor ? 2 : 4
      if (step < maxStep) {
        setStep(step + 1)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateStep()) {
      try {
        setLoading(true)
        setError(null)
        const user = authUtils.getCurrentUser()
        
        if (!user || !user.id) {
          setError('User not authenticated. Please login again.')
          setLoading(false)
          return
        }
        
        // Construct appointment data
        const startDateTime = new Date(`${formData.date}T${formData.time}`)
        const endDateTime = addMinutes(startDateTime, appointmentDuration) // Use dentist's appointment duration
        
        // Construct patient notes only if there's content
        let patientNotes = ''
        if (formData.treatment && formData.notes) {
          patientNotes = `${formData.treatment}: ${formData.notes}`
        } else if (formData.treatment) {
          patientNotes = formData.treatment
        } else if (formData.notes) {
          patientNotes = formData.notes
        }
        
        const appointmentData = {
          patientId: user.id,
          dentistId: parseInt(formData.dentistId),
          clinicId: parseInt(formData.clinicId),
          appointmentDate: formData.date,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          patientNotes: patientNotes || null,
          treatmentId: null
        }

        await onSave(appointmentData)
        handleClose()
      } catch (err) {
        console.error('Error submitting appointment:', err)
        const errorMessage = err.response?.data?.error || err.message || 'Failed to book appointment. Please try again.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleClose = () => {
    setFormData({
      clinicId: '',
      dentistId: '',
      date: '',
      time: '',
      treatment: '',
      notes: ''
    })
    setErrors({})
    setError(null)
    setClinics([])
    setDentists([])
    setAvailableSlots([])
    setBookedSlots([])
    onClose()
  }

  const selectedClinic = clinics.find(c => c.userId === parseInt(formData.clinicId))
  const selectedDentist = dentists.find(d => d.userId === parseInt(formData.dentistId))

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
          {preselectedDoctor && (
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              with Dr. {preselectedDoctor.firstName} {preselectedDoctor.lastName}
            </p>
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Select Clinic - Only show if no preselected doctor */}
              {!preselectedDoctor && step === 1 && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Choose a Clinic
                  </h3>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-4">{error}</p>
                      <Button onClick={fetchClinics}>Try Again</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clinics.map((clinic) => (
                        <div
                          key={clinic.userId}
                          onClick={() => handleClinicSelect(clinic.userId)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.clinicId === clinic.userId.toString()
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : isDarkMode
                                ? 'border-gray-700 hover:border-gray-600 bg-gray-700/50'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FaBuilding className="text-teal-600" />
                              <h4 className={`font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {clinic.clinicName}
                              </h4>
                            </div>
                          </div>
                          <div className={`text-sm space-y-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <p className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-xs" />
                              {clinic.city}{clinic.location ? `, ${clinic.location}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.clinicId && (
                    <p className="text-red-500 text-sm mt-2">{errors.clinicId}</p>
                  )}
                </div>
              )}

              {/* Step 2: Select Dentist - Only show if no preselected doctor */}
              {!preselectedDoctor && step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Choose a Dentist at {selectedClinic?.clinicName}
                    </h3>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : dentists.length === 0 ? (
                    <div className="text-center py-8">
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        No dentists available at this clinic
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {dentists.map((dentist) => (
                        <div
                          key={dentist.userId}
                          onClick={() => handleDentistSelect(dentist.userId)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.dentistId === dentist.userId.toString()
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : isDarkMode
                                ? 'border-gray-700 hover:border-gray-600 bg-gray-700/50'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                <FaUser className="text-white" />
                              </div>
                              <div>
                                <h4 className={`font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  Dr. {dentist.firstName} {dentist.lastName}
                                </h4>
                                <p className={`text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  License: {dentist.licenseNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {dentist.specialization?.map((spec, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs ${
                                  isDarkMode
                                    ? 'bg-gray-600 text-gray-200'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.dentistId && (
                    <p className="text-red-500 text-sm mt-2">{errors.dentistId}</p>
                  )}
                </div>
              )}

              {/* Date & Time Selection */}
              {((preselectedDoctor && step === 1) || (!preselectedDoctor && step === 3)) && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Select Date, Time & Treatment
                  </h3>

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
                        No available time slots for this date. The dentist may not be working on this day.
                      </p>
                    ) : (
                      <div className={`grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg ${
                        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        {availableSlots.map((time) => {
                          // Check if this time slot is booked
                          const isBooked = bookedSlots.includes(time)
                          
                          // Check if this time slot is in the past
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

                  {/* Notes */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaStickyNote className="inline mr-2" />
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any additional information or concerns..."
                      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {((preselectedDoctor && step === 2) || (!preselectedDoctor && step === 4)) && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Confirm Your Appointment
                  </h3>

                  <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FaBuilding className="text-teal-600 mt-1" />
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Clinic
                          </p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedClinic?.clinicName}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedClinic?.city}{selectedClinic?.location ? `, ${selectedClinic.location}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FaUser className="text-teal-600 mt-1" />
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Dentist
                          </p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Dr. {selectedDentist?.firstName} {selectedDentist?.lastName}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedDentist?.specialization?.join(', ') || 'General Dentistry'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FaCalendarAlt className="text-teal-600 mt-1" />
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Date & Time
                          </p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(formData.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {convertTo12Hour(formData.time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 mt-1" />
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Treatment
                          </p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formData.treatment}
                          </p>
                        </div>
                      </div>

                      {formData.notes && (
                        <div className="flex items-start gap-3">
                          <FaStickyNote className="text-teal-600 mt-1" />
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Notes
                            </p>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formData.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                      <strong>Note:</strong> Your appointment request will be sent to the clinic for confirmation. 
                      You will receive a notification once it's confirmed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && ((preselectedDoctor && step === 2) || (!preselectedDoctor && step === 4)) && (
              <div className="px-6 pb-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? handleClose : handleBack}
                disabled={loading}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>

              <div className="flex gap-3">
                {((preselectedDoctor && step < 2) || (!preselectedDoctor && step < 4)) && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-linear-to-r from-teal-600 to-cyan-600"
                    disabled={loading}
                  >
                    Next
                  </Button>
                )}
                {((preselectedDoctor && step === 2) || (!preselectedDoctor && step === 4)) && (
                  <Button
                    type="submit"
                    className="bg-linear-to-r from-teal-600 to-cyan-600"
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                )}
              </div>
            </div>
          </form>
    </BaseModal>,
    document.body
  )
}

export default BookAppointmentModal
