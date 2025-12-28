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
import { Button, BaseModal, Input, Select } from '../../common'
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
                  <Input
                    label="First Name *"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    placeholder="Enter first name"
                    icon={FaUser}
                  />

                  <Input
                    label="Last Name *"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    placeholder="Enter last name"
                    icon={FaUser}
                  />

                  <Input
                    label="Date of Birth *"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    error={errors.dateOfBirth}
                    max={getTodayISO()}
                    icon={FaCalendarAlt}
                  />

                  <Select
                    label="Gender *"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    error={errors.gender}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                    icon={FaVenusMars}
                  />

                  <div className="md:col-span-2">
                    <Select
                      label="City *"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      error={errors.city}
                      options={CITY_OPTIONS}
                      placeholder="Select city"
                      icon={FaMapMarkerAlt}
                    />
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
                    <Input
                      label="Phone Number *"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      placeholder="Enter phone number"
                      icon={FaPhone}
                    />

                    <Input
                      label="Email *"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      placeholder="Enter email address"
                      icon={FaEnvelope}
                    />

                    <Input
                      label="Password *"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      placeholder="Enter temporary password"
                      icon={FaLock}
                    />
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
