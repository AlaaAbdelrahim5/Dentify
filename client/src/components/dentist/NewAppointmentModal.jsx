import { useState, useEffect } from 'react'
import { 
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaStickyNote,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa'
import { Button, Input, Card } from '../index'
import { useTheme } from '../../contexts/ThemeContext'

const NewAppointmentModal = ({ isOpen, onClose, onSave, patients = [], prefilledData = null }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    date: '',
    time: '',
    duration: '30',
    treatment: '',
    notes: '',
    status: 'pending'
  })

  const [errors, setErrors] = useState({})

  // Effect to handle prefilled data
  useEffect(() => {
    if (isOpen && prefilledData) {
      const selectedPatient = patients.find(p => p.id === prefilledData.patientId)
      
      setFormData({
        patientId: prefilledData.patientId || '',
        patientName: selectedPatient?.name || prefilledData.patientName || '',
        patientPhone: selectedPatient?.phone || prefilledData.patientPhone || '',
        patientEmail: selectedPatient?.email || prefilledData.patientEmail || '',
        date: prefilledData.appointmentDate || prefilledData.date || '',
        time: prefilledData.time || '',
        duration: prefilledData.duration || '30',
        treatment: prefilledData.reason || prefilledData.treatment || '',
        notes: prefilledData.notes || '',
        status: prefilledData.status || 'pending'
      })
    } else if (isOpen && !prefilledData) {
      // Reset form when opening without prefilled data
      setFormData({
        patientId: '',
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        date: '',
        time: '',
        duration: '30',
        treatment: '',
        notes: '',
        status: 'pending'
      })
    }
  }, [isOpen, prefilledData, patients])

  const treatmentOptions = [
    'Dental Cleaning',
    'Dental Filling',
    'Root Canal',
    'Tooth Extraction',
    'Crown Installation',
    'Teeth Whitening',
    'Orthodontic Consultation',
    'Periodontal Treatment',
    'Dental Implant',
    'Emergency Care',
    'General Consultation'
  ]

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ]

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
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required'
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Phone number is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.time) {
      newErrors.time = 'Time is required'
    }

    if (!formData.treatment) {
      newErrors.treatment = 'Treatment type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      date: '',
      time: '',
      duration: '30',
      treatment: '',
      notes: '',
      status: 'pending'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            New Appointment
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <FaTimes className={`w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Treatment Connection Banner */}
          {prefilledData?.patientId && (
            <div className={`p-4 rounded-xl border-2 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-700' 
                : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-teal-900/50' : 'bg-teal-100'
                }`}>
                  <FaStethoscope className={`w-5 h-5 ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm mb-1 ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-700'
                  }`}>
                    Connected to Treatment Plan
                  </h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-teal-300/80' : 'text-teal-600/80'
                  }`}>
                    This appointment is automatically linked to the patient's treatment plan. Patient information has been pre-filled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Patient Information
            </h3>
            
            {/* Patient Selector (if patients list is provided) */}
            {patients && patients.length > 0 && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Patient
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={(e) => {
                    const selectedPatient = patients.find(p => p.id.toString() === e.target.value)
                    setFormData(prev => ({
                      ...prev,
                      patientId: e.target.value,
                      patientName: selectedPatient?.name || '',
                      patientPhone: selectedPatient?.phone || '',
                      patientEmail: selectedPatient?.email || ''
                    }))
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  disabled={!!prefilledData?.patientId}
                >
                  <option value="">Select a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {prefilledData?.patientId && (
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Patient is pre-selected from treatment
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Patient Name {prefilledData?.patientId ? '' : '*'}
                </label>
                <div className="relative">
                  <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    readOnly={!!formData.patientId || !!prefilledData?.patientId}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                      errors.patientName 
                        ? 'border-red-500' 
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                    } ${(formData.patientId || prefilledData?.patientId) ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter patient name"
                  />
                </div>
                {(formData.patientId || prefilledData?.patientId) && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-filled from patient record
                  </p>
                )}
                {errors.patientName && (
                  <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone Number {prefilledData?.patientId ? '' : '*'}
                </label>
                <div className="relative">
                  <FaPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="tel"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleInputChange}
                    readOnly={!!formData.patientId || !!prefilledData?.patientId}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                      errors.patientPhone 
                        ? 'border-red-500' 
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                    } ${(formData.patientId || prefilledData?.patientId) ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter phone number"
                  />
                </div>
                {(formData.patientId || prefilledData?.patientId) && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-filled from patient record
                  </p>
                )}
                {errors.patientPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.patientPhone}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email (Optional)
              </label>
              <div className="relative">
                <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Appointment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                      errors.date 
                        ? 'border-red-500' 
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time *
                </label>
                <div className="relative">
                  <FaClock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                      errors.time 
                        ? 'border-red-500' 
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Treatment Type *
                </label>
                <div className="relative">
                  <FaStethoscope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  {prefilledData?.reason ? (
                    <input
                      type="text"
                      name="treatment"
                      value={formData.treatment}
                      readOnly
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-opacity-50 cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  ) : (
                    <select
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                        errors.treatment 
                          ? 'border-red-500' 
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">Select treatment</option>
                      {treatmentOptions.map(treatment => (
                        <option key={treatment} value={treatment}>
                          {treatment}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {prefilledData?.reason && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    From treatment plan step
                  </p>
                )}
                {errors.treatment && (
                  <p className="text-red-500 text-sm mt-1">{errors.treatment}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Notes
              </label>
              <div className="relative">
                <FaStickyNote className={`absolute left-3 top-3 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Additional notes about the appointment..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Create Appointment
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default NewAppointmentModal