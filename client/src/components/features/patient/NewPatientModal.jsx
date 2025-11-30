import { useState } from 'react'
import { 
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVenusMars,
  FaLock
} from 'react-icons/fa'
import { Button } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'

const NewPatientModal = ({ isOpen, onClose, onSave }) => {
  const { isDarkMode } = useTheme()
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

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ]

  const cities = [
    { value: 'Ramallah', label: 'Ramallah' },
    { value: 'Jerusalem', label: 'Jerusalem' },
    { value: 'Bethlehem', label: 'Bethlehem' },
    { value: 'Hebron', label: 'Hebron' },
    { value: 'Nablus', label: 'Nablus' },
    { value: 'Jenin', label: 'Jenin' },
    { value: 'Gaza', label: 'Gaza' },
    { value: 'Khan Yunis', label: 'Khan Yunis' },
    { value: 'Rafah', label: 'Rafah' }
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password is required (minimum 6 characters)'
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      password: '',
      city: ''
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
          className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
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
            Add New Patient
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

        {/* Form - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                      max={new Date().toISOString().split('T')[0]}
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
                      {genderOptions.map(option => (
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
              </div>
            </div>

            {/* Account & Contact Information */}
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
                  Email <span className="text-red-500">*</span>
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
                    Password <span className="text-red-500">*</span>
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
                      {cities.map(city => (
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
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
                Add Patient
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default NewPatientModal