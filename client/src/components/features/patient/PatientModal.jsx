import { useState, useEffect } from 'react'
import { getTodayISO } from '../../../utils/helpers'
import { 
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVenusMars,
  FaLock
} from 'react-icons/fa'
import { Button, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { CITY_OPTIONS, GENDER_OPTIONS } from '../../../utils/constants'
import { validateEmail } from '../../../utils/validation'

/**
 * PatientModal Component
 * Unified modal for adding and editing patients
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal handler
 * @param {Function} onSave - Save handler
 * @param {Object} patientData - Patient data for editing (null for new patient)
 */
const PatientModal = ({ isOpen, onClose, onSave, patientData = null }) => {
  const { isDarkMode } = useTheme()
  const isEditMode = !!patientData
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    city: ''
  })

  const [errors, setErrors] = useState({})

  // Populate form when patient data changes
  useEffect(() => {
    if (patientData) {
      // Format date for input field (YYYY-MM-DD)
      let formattedDate = ''
      if (patientData.dateOfBirth || patientData.birthDate) {
        const date = new Date(patientData.dateOfBirth || patientData.birthDate)
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0]
        }
      }

      setFormData({
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
        dateOfBirth: formattedDate,
        gender: patientData.gender || '',
        phone: patientData.phone || '',
        email: patientData.email || '',
        password: '', // Password should be empty when editing
        city: patientData.city || patientData.address || ''
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        city: ''
      })
    }
    setErrors({})
  }, [patientData, isOpen])

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    // Password required for new patients only
    if (!isEditMode) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      }

      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password is required (minimum 6 characters)'
      }

      const emailError = validateEmail(formData.email)
      if (emailError) {
        newErrors.email = emailError
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      if (isEditMode) {
        onSave({ ...patientData, ...formData })
      } else {
        onSave(formData)
      }
      handleClose()
    }
  }

  const handleClose = () => {
    if (!isEditMode) {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        city: ''
      })
    }
    setErrors({})
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Patient Information' : 'Add New Patient'}
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <FaUser className="text-teal-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.firstName 
                          ? 'border-red-500' 
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.lastName 
                          ? 'border-red-500' 
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        max={getTodayISO()}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                          errors.dateOfBirth 
                            ? 'border-red-500' 
                            : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white'
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gender *
                    </label>
                    <div className="relative">
                      <FaVenusMars className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                          errors.gender 
                            ? 'border-red-500' 
                            : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white'
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      City *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                          errors.city 
                            ? 'border-red-500' 
                            : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white'
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="">Select city</option>
                        {CITY_OPTIONS.map(city => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account & Contact Information - Only for new patients */}
              {!isEditMode && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <FaPhone className="text-teal-600" />
                    Account & Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FaPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                            errors.phone 
                              ? 'border-red-500' 
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-700 text-white'
                                : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email *
                      </label>
                      <div className="relative">
                        <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                            errors.email 
                              ? 'border-red-500' 
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-700 text-white'
                                : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Password *
                      </label>
                      <div className="relative">
                        <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                            errors.password 
                              ? 'border-red-500' 
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-700 text-white'
                                : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="Enter temporary password"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

        {/* Actions */}
        <div className={`flex justify-end gap-3 pt-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
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
            {isEditMode ? 'Update Patient' : 'Add Patient'}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}

export default PatientModal
