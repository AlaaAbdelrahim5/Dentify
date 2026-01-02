import { useState, useEffect } from 'react'
import { FaUserShield, FaSave, FaUser, FaPhone, FaEnvelope, FaLock } from 'react-icons/fa'
import { Button, Input, BaseModal, PhoneInput } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { validateEmail } from '../../../utils/validation'
import { adminAPI } from '../../../services/api'

export const AddAdminModal = ({ isOpen, onClose, onSave }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    countryCode: '+970',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    gender: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      countryCode: '+970',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      gender: ''
    })
    setErrors({})
  }

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) {
        newErrors.email = emailError
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.phoneNumber) {
      newErrors.phone = 'Phone number is required'
    } else if (formData.phoneNumber.length < 7) {
      newErrors.phone = 'Phone number must be at least 7 digits'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await adminAPI.createAdmin({
        ...formData,
        phone: `${formData.countryCode}${formData.phoneNumber}`
      })

      if (response.success) {
        onSave()
        onClose()
      } else {
        if (response.errors) {
          setErrors(response.errors)
        } else {
          setErrors({
            general: response.message || 'An error occurred while creating the admin'
          })
        }
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Admin"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className={`p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{errors.general}</p>
          </div>
        )}

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
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              error={errors.firstName}
            />

            <Input
              label="Last Name *"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter last name"
              error={errors.lastName}
            />

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`
                  block w-full rounded-lg border py-3 px-3 text-sm shadow-sm transition-all duration-200
                  focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
                  ${isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                  }
                  ${errors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                `}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>{errors.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <FaPhone className="text-teal-600" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="admin@example.com"
              error={errors.email}
            />

            <PhoneInput 
              label="Phone Number *"
              countryCode={formData.countryCode}
              phoneNumber={formData.phoneNumber}
              onCountryCodeChange={(value) => handleInputChange("countryCode", value)}
              onPhoneNumberChange={(value) => handleInputChange("phoneNumber", value)}
              error={errors.phone}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Account Security */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <FaLock className="text-teal-600" />
            Account Security
          </h3>
          
          <Input
            label="Password *"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter password"
            error={errors.password}
          />
        </div>

        {/* Action Buttons */}
        <div className={`flex justify-end gap-3 pt-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4 mr-2" />
                Create Admin
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}
