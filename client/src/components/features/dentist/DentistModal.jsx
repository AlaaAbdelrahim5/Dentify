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
  FaLock
} from 'react-icons/fa'
import { Button, Input, Select, BaseModal, PhoneInput } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { PALESTINIAN_CITIES } from '../../../utils/constants'
import { validateEmail, validatePhone, validateAge, validatePassword } from '../../../utils/validation'

const DentistModal = ({ isOpen, onClose, onSave, dentist }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+970',
    phoneNumber: '',
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

  useEffect(() => {
    if (dentist) {
      // Parse phone number into country code and number
      const fullPhone = dentist.userId?.phone || '';
      let parsedCountryCode = '+970';
      let parsedPhoneNumber = '';
      
      if (fullPhone) {
        // Try to extract country code (starts with + and has 1-4 digits)
        const countryCodeMatch = fullPhone.match(/^(\+\d{1,4})/);
        if (countryCodeMatch) {
          parsedCountryCode = countryCodeMatch[1];
          parsedPhoneNumber = fullPhone.slice(countryCodeMatch[1].length).replace(/\D/g, '');
        } else {
          // If no country code found, assume it's just the number
          parsedPhoneNumber = fullPhone.replace(/\D/g, '');
        }
      }

      setFormData({
        firstName: dentist.firstName || '',
        lastName: dentist.lastName || '',
        email: dentist.userId?.email || '',
        countryCode: parsedCountryCode,
        phoneNumber: parsedPhoneNumber,
        password: '', // Don't populate password for existing users
        licenseNumber: dentist.licenseNumber || '',
        birthDate: dentist.birthDate ? dentist.birthDate.split('T')[0] : '',
        gender: dentist.gender || '',
        city: dentist.city || dentist.address?.city || '',
        appointmentDuration: dentist.appointmentDuration || 30
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+970',
        phoneNumber: '',
        password: '',
        licenseNumber: '',
        birthDate: '',
        gender: '',
        city: '',
        appointmentDuration: 30
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
    if (!formData.phoneNumber) newErrors.phone = 'Phone number is required'
    else if (formData.phoneNumber.length < 7) newErrors.phone = 'Phone number must be at least 7 digits'
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.city) newErrors.city = 'City is required'
    
    // Password required for new users only
    if (!dentist && !formData.password) {
      newErrors.password = 'Password is required for new dentists'
    }

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // Age validation (minimum 22 years for dentists)
    if (formData.birthDate) {
      const today = new Date()
      const birthDate = new Date(formData.birthDate)
      let age = today.getFullYear() - birthDate.getFullYear()
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
        specialization: ['General Dentistry'],
        birthDate: formData.birthDate,
        gender: formData.gender,
        city: formData.city || (dentist?.address?.city) || 'Ramallah',
        appointmentDuration: parseInt(formData.appointmentDuration),
        // User data for creating or updating the user account
        email: formData.email.trim(),
        phone: `${formData.countryCode}${formData.phoneNumber}`,
        ...(formData.password && { password: formData.password }),
        role: 'Dentist'
      }

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

  const handleCountryCodeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: e.target.value,
    }));

    // Clear phone error when country code changes
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));

    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  const updateWorkingHour = (index, field, value) => {
    
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      noPadding
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]">
        {/* Fixed Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <FaUserMd className="w-6 h-6 text-teal-600" />
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {dentist ? 'Edit Dentist' : 'Request New Dentist'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* General Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.submit}</p>
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
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    error={errors.firstName}
                    icon={FaUser}
                  />

                  <Input
                    label="Last Name *"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    error={errors.lastName}
                    icon={FaUser}
                  />

                  <Input
                    label="Birth Date *"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    error={errors.birthDate}
                    icon={FaCalendarAlt}
                  />

                  <Select
                    label="Gender *"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    error={errors.gender}
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' }
                    ]}
                    placeholder="Select gender"
                    icon={FaUser}
                  />

                  <Select
                    label="City *"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    error={errors.city}
                    options={PALESTINIAN_CITIES.map(city => ({ value: city, label: city }))}
                    placeholder="Select city"
                    icon={FaMapMarkerAlt}
                  />

                  <Input
                    label="License Number *"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="Enter license number"
                    error={errors.licenseNumber}
                    icon={FaCertificate}
                  />
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
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    error={errors.email}
                    icon={FaEnvelope}
                  />

                  <PhoneInput
                    label="Phone Number *"
                    countryCode={formData.countryCode}
                    phoneNumber={formData.phoneNumber}
                    onCountryChange={handleCountryCodeChange}
                    onPhoneChange={handlePhoneNumberChange}
                    placeholder="Enter phone number"
                    error={errors.phone}
                    icon={FaPhone}
                  />
                </div>
              </div>

              {/* Account Security */}
              {!dentist && (
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
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    error={errors.password}
                    icon={FaLock}
                  />
                </div>
              )}

              {/* Note */}
              {!dentist && (
                <div className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-teal-900/30 border-teal-800/50 text-teal-300' 
                    : 'bg-teal-50 border-teal-200 text-teal-700'
                }`}>
                  <p className="text-sm">
                    <strong>Note:</strong> This dentist request will be sent to the admin for approval. 
                    The dentist will be notified once approved and can start using the system.
                  </p>
                </div>
              )}
        </div>

        {/* Fixed Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t shrink-0 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
            className="flex items-center gap-2 bg-linear-to-r from-teal-600 to-cyan-600"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              dentist ? 'Update Dentist' : 'Send Request'
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}

export default DentistModal