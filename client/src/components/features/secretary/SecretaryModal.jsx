import { useState, useEffect } from 'react'
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaUserTie, FaMapMarkerAlt, FaLock, FaTimes, FaSave } from 'react-icons/fa'
import { Button, Input, BaseModal, PhoneInput } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { PALESTINIAN_CITIES } from '../../../utils/constants'
import { validateEmail, validatePhone, validateAge, validatePassword } from '../../../utils/validation'

const SecretaryModal = ({ isOpen, onClose, onSave, secretary }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+970',
    phoneNumber: '',
    birthDate: '',
    gender: '',
    city: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (secretary) {
      // Parse phone number
      const fullPhone = secretary.userId?.phone || '';
      let parsedCountryCode = '+970';
      let parsedPhoneNumber = '';
      
      if (fullPhone) {
        const countryCodeMatch = fullPhone.match(/^(\+\d{1,4})/);
        if (countryCodeMatch) {
          parsedCountryCode = countryCodeMatch[1];
          parsedPhoneNumber = fullPhone.slice(countryCodeMatch[1].length).replace(/\D/g, '');
        } else {
          parsedPhoneNumber = fullPhone.replace(/\D/g, '');
        }
      }

      setFormData({
        firstName: secretary.firstName || '',
        lastName: secretary.lastName || '',
        email: secretary.userId?.email || '',
        countryCode: parsedCountryCode,
        phoneNumber: parsedPhoneNumber,
        birthDate: secretary.birthDate ? secretary.birthDate.split('T')[0] : '',
        gender: secretary.gender?.toLowerCase() || '', // Convert to lowercase for consistency
        city: secretary.address?.city || '',
        password: '' // Don't populate password for existing users
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+970',
        phoneNumber: '',
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
    if (!formData.phoneNumber) newErrors.phone = 'Phone number is required'
    else if (formData.phoneNumber.length < 7) newErrors.phone = 'Phone number must be at least 7 digits'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.city) newErrors.city = 'City is required'
    
    // Password required for new users only
    if (!secretary && !formData.password) {
      newErrors.password = 'Password is required for new users'
    }

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // Age validation (minimum 18 years)
    const ageError = validateAge(formData.birthDate, 18)
    if (ageError) {
      newErrors.birthDate = ageError
    }

    // Password validation for new users
    const passwordError = validatePassword(formData.password, !secretary)
    if (passwordError) {
      newErrors.password = passwordError
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
      const requestData = {
        userData: {
          email: formData.email.trim(),
          phone: `${formData.countryCode}${formData.phoneNumber}`,
          ...(formData.password && { password: formData.password })
        },
        secretaryData: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          birthDate: formData.birthDate,
          gender: formData.gender,
          address: {
            city: formData.city
          }
        }
      }

      await onSave(requestData)
      // Don't close modal here - let the parent component handle it after successful save
    } catch (error) {
      console.error('Error saving secretary:', error)
      setErrors({ submit: error.message || 'Failed to save secretary. Please try again.' })
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

  const handleCountryCodeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: e.target.value,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div className="flex items-center gap-3">
          <FaUserTie className="w-6 h-6 text-teal-600" />
          <span>{secretary ? 'Edit Secretary' : 'Request New Secretary'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="overflow-y-auto overflow-x-hidden max-h-[calc(90vh-250px)] pr-2 space-y-6">
          {secretary ? 'Edit Secretary' : 'Request New Secretary'}

            {/* General Error */}
            {/* General Error */}
          {errors.submit && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-800 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <p className="text-sm">{errors.submit}</p>
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
                    {PALESTINIAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Security */}
            {!secretary && (
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
        {!secretary && (
          <div className={`p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-teal-900/30 border-teal-800/50 text-teal-300' 
              : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}>
            <p className="text-sm">
              <strong>Note:</strong> This secretary request will be sent to the admin for approval. The secretary will be notified once approved and can start using the system.
            </p>
          </div>
        )}
        </div>

        {/* Action Buttons */}
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
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                {secretary ? 'Update Secretary' : 'Send Request'}
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}

export default SecretaryModal