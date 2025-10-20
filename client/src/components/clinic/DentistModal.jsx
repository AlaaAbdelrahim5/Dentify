import { useState, useEffect } from 'react'
import { 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaUserMd, 
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCertificate,
  FaClock,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaPlus,
  FaTrash
} from 'react-icons/fa'
import { FaTiktok } from 'react-icons/fa'
import { Button, Input } from '../../components'
import { useTheme } from '../../contexts/ThemeContext'

const DentistModal = ({ isOpen, onClose, onSave, dentist }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    specialization: [],
    birthDate: '',
    gender: '',
    city: '',
    appointmentDuration: 30,
    workingHours: [],
    socialLinks: {
      facebook: '',
      instagram: '',
      whatsapp: '',
      tiktok: ''
    }
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Palestinian cities
  const cities = [
    'Acre', 'Al-Bireh', 'Beersheba', 'Beit Hanoun', 'Beit Jala', 'Beit Lahia',
    'Beit Sahour', 'Bethlehem', 'Deir al-Balah', 'Gaza', 'Haifa', 'Hebron',
    'Jabalya', 'Jaffa', 'Jenin', 'Jericho', 'Jerusalem', 'Khan Yunis',
    'Lydd', 'Nablus', 'Nazareth', 'Qalqilya', 'Rafah', 'Ramallah',
    'Ramla', 'Safad', 'Salfit', 'Tiberias', 'Tubas', 'Tulkarm'
  ]

  // Specializations
  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Pathology',
    'Cosmetic Dentistry',
    'Implantology'
  ]

  // Days of the week
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  useEffect(() => {
    if (dentist) {
      setFormData({
        firstName: dentist.firstName || '',
        lastName: dentist.lastName || '',
        email: dentist.userId?.email || '',
        phone: dentist.userId?.phone || '',
        password: '', // Don't populate password for existing users
        licenseNumber: dentist.licenseNumber || '',
        specialization: dentist.specialization || [],
        birthDate: dentist.birthDate ? dentist.birthDate.split('T')[0] : '',
        gender: dentist.gender || '',
        city: dentist.city || dentist.address?.city || '',
        appointmentDuration: dentist.appointmentDuration || 30,
        workingHours: dentist.workingHours || [],
        socialLinks: {
          facebook: dentist.socialLinks?.facebook || '',
          instagram: dentist.socialLinks?.instagram || '',
          whatsapp: dentist.socialLinks?.whatsapp || '',
          tiktok: dentist.socialLinks?.tiktok || ''
        }
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        licenseNumber: '',
        specialization: [],
        birthDate: '',
        gender: '',
        city: '',
        appointmentDuration: 30,
        workingHours: [],
        socialLinks: {
          facebook: '',
          instagram: '',
          whatsapp: '',
          tiktok: ''
        }
      })
    }
    setErrors({})
  }, [dentist, isOpen])

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (formData.specialization.length === 0) newErrors.specialization = 'At least one specialization is required'
    
    // Password required for new users only
    if (!dentist && !formData.password) {
      newErrors.password = 'Password is required for new dentists'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (Palestinian format)
    const phoneRegex = /^(\+970|0)?[0-9]{8,9}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Palestinian phone number'
    }

    // Age validation (minimum 22 years for dentists)
    if (formData.birthDate) {
      const today = new Date()
      const birthDate = new Date(formData.birthDate)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 22) {
        newErrors.birthDate = 'Dentist must be at least 22 years old'
      }
    }

    // Password validation for new users
    if (!dentist && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Working hours validation
    if (formData.workingHours.length > 0) {
      formData.workingHours.forEach((schedule, index) => {
        if (!schedule.startTime || !schedule.endTime) {
          newErrors[`workingHours_${index}`] = 'Start time and end time are required'
        } else if (schedule.startTime >= schedule.endTime) {
          newErrors[`workingHours_${index}`] = 'End time must be after start time'
        }
      })
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
      const dentistData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        specialization: formData.specialization,
        birthDate: formData.birthDate,
        gender: formData.gender,
        city: formData.city || (dentist?.address?.city) || 'Ramallah',
        appointmentDuration: parseInt(formData.appointmentDuration),
        workingHours: formData.workingHours,
        socialLinks: formData.socialLinks,
        // User data for creating or updating the user account
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        ...(formData.password && { password: formData.password }),
        role: 'Dentist'
      }

      console.log('🔍 Sending dentist data:', dentistData)
      console.log('🔍 Working hours:', dentistData.workingHours)
      console.log('🔍 City value:', dentistData.city)

      await onSave(dentistData)
      // Don't close modal here - let the parent component handle it after successful save
    } catch (error) {
      console.error('Error saving dentist:', error)
      setErrors({ submit: error.message || 'Failed to save dentist request. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }))
    
    if (errors.specialization) {
      setErrors(prev => ({ ...prev, specialization: '' }))
    }
  }

  const addWorkingHour = () => {
    setFormData(prev => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { day: '', startTime: '', endTime: '' }
      ]
    }))
  }

  const removeWorkingHour = (index) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index)
    }))
  }

  const updateWorkingHour = (index, field, value) => {
    if (field === 'startTime' || field === 'endTime') {
      console.log(`Time input ${field}:`, value, 'typeof:', typeof value)
    }
    
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((schedule, i) =>
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }))
    
    // Clear error when user updates
    const errorKey = `workingHours_${index}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }))
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
          className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
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
              <FaUserMd className="w-6 h-6 text-teal-600" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {dentist ? 'Edit Dentist' : 'Request New Dentist'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* General Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.submit}</p>
                </div>
              )}

              {!dentist && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> This dentist request will be sent to the admin for approval. 
                    The dentist will be notified once approved and can start using the system.
                  </p>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <FaUser className="w-5 h-5 text-teal-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
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
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <FaEnvelope className="w-5 h-5 text-teal-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="+970-XX-XXXXXXX"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {!dentist && (
                    <div className="md:col-span-2">
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

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <FaCertificate className="w-5 h-5 text-teal-600" />
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      License Number *
                    </label>
                    <div className="relative">
                      <FaCertificate className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <Input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className={`pl-10 ${errors.licenseNumber ? 'border-red-500' : ''}`}
                        placeholder="Enter license number"
                      />
                    </div>
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Appointment Duration (minutes)
                    </label>
                    <div className="relative">
                      <FaClock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <Input
                        type="number"
                        value={formData.appointmentDuration}
                        onChange={(e) => handleInputChange('appointmentDuration', e.target.value)}
                        className="pl-10"
                        min="15"
                        max="120"
                        step="15"
                      />
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Specializations * (Select at least one)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {specializations.map((specialization) => (
                      <label
                        key={specialization}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.specialization.includes(specialization)
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : isDarkMode
                            ? 'border-gray-600 hover:border-gray-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(specialization)}
                          onChange={() => handleSpecializationChange(specialization)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {specialization}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.specialization && (
                    <p className="mt-2 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <FaClock className="w-5 h-5 text-teal-600" />
                    Working Hours
                  </h3>
                  <Button
                    type="button"
                    onClick={addWorkingHour}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Schedule
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.workingHours.map((schedule, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Schedule {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeWorkingHour(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Day
                          </label>
                          <select
                            value={schedule.day}
                            onChange={(e) => updateWorkingHour(index, 'day', e.target.value)}
                            className={`w-full px-3 py-2 text-sm rounded border ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Select day</option>
                            {daysOfWeek.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateWorkingHour(index, 'startTime', e.target.value)}
                            className={`w-full px-3 py-2 text-sm rounded border ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            End Time
                          </label>
                          <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateWorkingHour(index, 'endTime', e.target.value)}
                            className={`w-full px-3 py-2 text-sm rounded border ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                      
                      {errors[`workingHours_${index}`] && (
                        <p className="mt-2 text-xs text-red-600">{errors[`workingHours_${index}`]}</p>
                      )}
                    </div>
                  ))}
                  
                  {formData.workingHours.length === 0 && (
                    <p className={`text-sm text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No working hours added yet. Click "Add Schedule" to get started.
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <FaInstagram className="w-5 h-5 text-teal-600" />
                  Social Media Links (Optional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Facebook
                    </label>
                    <div className="relative">
                      <FaFacebook className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <Input
                        type="url"
                        value={formData.socialLinks.facebook}
                        onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                        className="pl-10"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Instagram
                    </label>
                    <div className="relative">
                      <FaInstagram className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <Input
                        type="url"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                        className="pl-10"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      WhatsApp
                    </label>
                    <div className="relative">
                      <FaWhatsapp className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <Input
                        type="tel"
                        value={formData.socialLinks.whatsapp}
                        onChange={(e) => handleInputChange('socialLinks.whatsapp', e.target.value)}
                        className="pl-10"
                        placeholder="+970-XX-XXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      TikTok
                    </label>
                    <div className="relative">
                      <FaTiktok className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <Input
                        type="url"
                        value={formData.socialLinks.tiktok}
                        onChange={(e) => handleInputChange('socialLinks.tiktok', e.target.value)}
                        className="pl-10"
                        placeholder="https://tiktok.com/@..."
                      />
                    </div>
                  </div>
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
                    dentist ? 'Update Dentist' : 'Send Request'
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

export default DentistModal