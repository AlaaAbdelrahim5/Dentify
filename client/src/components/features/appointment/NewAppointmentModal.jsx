import { useState } from 'react'
import { createPortal } from 'react-dom'
import { 
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaStickyNote
} from 'react-icons/fa'
import { Button, Input, LoadingSpinner, BaseModal } from '../../common'
import { AppointmentSlotPicker } from '../'
import { useTheme } from '../../../contexts/ThemeContext'
import { useFormInput, useFormErrors } from '../../../hooks'
import { appointmentsAPI } from '../../../services/api'
import { authUtils } from '../../../utils/auth'
import { addMinutes, getTodayISO } from '../../../utils/helpers'

const NewAppointmentModal = ({ isOpen, onClose, onSave, preselectedPatient = null, preselectedDentist = null }) => {
  const { isDarkMode } = useTheme()
  const { formData, setFormData, handleInputChange: handleInput, resetForm } = useFormInput({
    date: '',
    time: '',
    sessionNotes: ''
  })
  const { errors, setErrors, clearError } = useFormErrors({})
  const [loading, setLoading] = useState(false)
  const [appointmentDuration, setAppointmentDuration] = useState(30)

  const handleInputChange = (e) => {
    handleInput(e)
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      clearError(e.target.name)
    }

    // Validate date/time combination when date or time changes
    if (e.target.name === 'date' || e.target.name === 'time') {
      const currentDate = e.target.name === 'date' ? e.target.value : formData.date
      const currentTime = e.target.name === 'time' ? e.target.value : formData.time
      
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
    
    clearError('time')
    setFormData(prev => ({ ...prev, time }))
  }

  // Get dentist ID
  const getDentistId = () => {
    const user = authUtils.getCurrentUser()
    return preselectedDentist?.id || user?.id
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
    resetForm()
    setErrors({})
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
                  <label className={`block text-sm font-medium mb-4 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaClock className="inline mr-2" />
                    Appointment Time
                  </label>
                  
                  <AppointmentSlotPicker
                    apiCall={appointmentsAPI.getAvailableSlots}
                    dentistId={getDentistId()}
                    selectedDate={formData.date}
                    selectedTime={formData.time}
                    onTimeSelect={handleTimeSelect}
                  />
                  
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
