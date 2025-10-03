import { useState, useEffect } from 'react'
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaUserTie, FaMapMarkerAlt } from 'react-icons/fa'
import { Button, Input } from '../../components'
import { useTheme } from '../../contexts/ThemeContext'

const SecretaryModal = ({ isOpen, onClose, onSave, secretary }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    city: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Syrian cities
  const cities = [
    'Damascus', 'Aleppo', 'Homs', 'Hama', 'Lattakia', 'Deir ez-Zor', 
    'Raqqa', 'Daraa', 'Al-Hasakah', 'Qamishli', 'Tartus', 'Idlib',
    'Douma', 'Jaramana', 'Al-Bab', 'Salamiyah', 'Safita', 'Manbij'
  ]

  useEffect(() => {
    if (secretary) {
      setFormData({
        firstName: secretary.firstName || '',
        lastName: secretary.lastName || '',
        email: secretary.userId?.email || '',
        phone: secretary.userId?.phone || '',
        birthDate: secretary.birthDate ? secretary.birthDate.split('T')[0] : '',
        gender: secretary.gender || '',
        city: secretary.address?.city || '',
        password: '' // Don't populate password for existing users
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
        city: '',
        password: ''
      })
    }
    setErrors({})
  }, [secretary, isOpen])

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.city) newErrors.city = 'City is required'
    
    // Password required for new users only
    if (!secretary && !formData.password) {
      newErrors.password = 'Password is required for new users'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (Syrian format)
    const phoneRegex = /^(\+963|0)?[0-9]{9,10}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Syrian phone number'
    }

    // Age validation (minimum 18 years)
    if (formData.birthDate) {
      const today = new Date()
      const birthDate = new Date(formData.birthDate)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 18) {
        newErrors.birthDate = 'Secretary must be at least 18 years old'
      }
    }

    // Password validation for new users
    if (!secretary && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const secretaryData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: {
          city: formData.city
        },
        userId: {
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          ...(formData.password && { password: formData.password }),
          role: 'Secretary',
          status: 'active'
        }
      }

      await onSave(secretaryData)
    } catch (error) {
      console.error('Error saving secretary:', error)
      setErrors({ submit: 'Failed to save secretary. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
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
          <div
            className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <FaUserTie className="w-6 h-6 text-teal-600" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {secretary ? 'Edit Secretary' : 'Add New Secretary'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Form Container with Scroll */}
          <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <FaUser className="w-5 h-5 text-teal-600" />
                Personal Information
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  First Name *
                </label>
                <div className="relative">
                  <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Last Name *
                </label>
                <div className="relative">
                  <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Birth Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={`pl-10 ${errors.birthDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.gender ? 'border-red-500' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <FaEnvelope className="w-5 h-5 text-teal-600" />
                Contact Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+963-XXX-XXXXXX"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.city ? 'border-red-500' : ''}`}
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {!secretary && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex justify-end gap-3 pt-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                secretary ? 'Update Secretary' : 'Add Secretary'
              )}
            </Button>
          </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}

export default SecretaryModal