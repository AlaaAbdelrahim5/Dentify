import { useState, useEffect } from 'react'
import { 
  FaTimes, 
  FaHospital, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaGlobe,
  FaClock,
  FaSave,
  FaLock
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'

const ClinicModal = ({ isOpen, onClose, clinic = null, onSave }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: ''
    },
    phone: {
      countryCode: '+970',
      number: ''
    },
    email: '',
    website: '',
    description: '',
    registrationNumber: '',
    password: '',
    workingHours: {
      sunday: { isOpen: true, start: '09:00', end: '17:00' },
      monday: { isOpen: true, start: '09:00', end: '17:00' },
      tuesday: { isOpen: true, start: '09:00', end: '17:00' },
      wednesday: { isOpen: true, start: '09:00', end: '17:00' },
      thursday: { isOpen: true, start: '09:00', end: '17:00' },
      friday: { isOpen: false, start: '09:00', end: '17:00' },
      saturday: { isOpen: true, start: '09:00', end: '17:00' }
    },
    services: []
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const cities = [
    { value: 'acre', label: 'Acre' },
    { value: 'al_bireh', label: 'Al-Bireh' },
    { value: 'beersheba', label: 'Beersheba' },
    { value: 'beit_hanoun', label: 'Beit Hanoun' },
    { value: 'beit_jala', label: 'Beit Jala' },
    { value: 'beit_lahia', label: 'Beit Lahia' },
    { value: 'beit_sahour', label: 'Beit Sahour' },
    { value: 'bethlehem', label: 'Bethlehem' },
    { value: 'deir_al_balah', label: 'Deir al-Balah' },
    { value: 'gaza', label: 'Gaza' },
    { value: 'haifa', label: 'Haifa' },
    { value: 'hebron', label: 'Hebron' },
    { value: 'jabalya', label: 'Jabalya' },
    { value: 'jaffa', label: 'Jaffa' },
    { value: 'jenin', label: 'Jenin' },
    { value: 'jericho', label: 'Jericho' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'khan_yunis', label: 'Khan Yunis' },
    { value: 'lydd', label: 'Lydd' },
    { value: 'nablus', label: 'Nablus' },
    { value: 'nazareth', label: 'Nazareth' },
    { value: 'qalqilya', label: 'Qalqilya' },
    { value: 'rafah', label: 'Rafah' },
    { value: 'ramallah', label: 'Ramallah' },
    { value: 'ramla', label: 'Ramla' },
    { value: 'safad', label: 'Safad' },
    { value: 'salfit', label: 'Salfit' },
    { value: 'tiberias', label: 'Tiberias' },
    { value: 'tubas', label: 'Tubas' },
    { value: 'tulkarm', label: 'Tulkarm' }
  ]

  const availableServices = [
    { value: 'general_dentistry', label: 'General Dentistry' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'oral_surgery', label: 'Oral Surgery' },
    { value: 'endodontics', label: 'Endodontics' },
    { value: 'periodontics', label: 'Periodontics' },
    { value: 'prosthodontics', label: 'Prosthodontics' },
    { value: 'pediatric_dentistry', label: 'Pediatric Dentistry' },
    { value: 'cosmetic_dentistry', label: 'Cosmetic Dentistry' },
    { value: 'oral_pathology', label: 'Oral Pathology' },
    { value: 'dental_implants', label: 'Dental Implants' }
  ]

  const dayNames = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
  }

  // Reset form when modal opens/closes or clinic changes
  useEffect(() => {
    if (isOpen) {
      if (clinic) {
        // Editing existing clinic
        setFormData({
          name: clinic.name || '',
          address: {
            street: clinic.address?.street || '',
            city: clinic.address?.city || ''
          },
          phone: {
            countryCode: clinic.phone?.countryCode || '+970',
            number: clinic.phone?.number || ''
          },
          email: clinic.email || '',
          website: clinic.website || '',
          description: clinic.description || '',
          registrationNumber: clinic.registrationNumber || '',
          password: '', // Password field should be empty when editing
          workingHours: clinic.workingHours || {
            sunday: { isOpen: true, start: '09:00', end: '17:00' },
            monday: { isOpen: true, start: '09:00', end: '17:00' },
            tuesday: { isOpen: true, start: '09:00', end: '17:00' },
            wednesday: { isOpen: true, start: '09:00', end: '17:00' },
            thursday: { isOpen: true, start: '09:00', end: '17:00' },
            friday: { isOpen: false, start: '09:00', end: '17:00' },
            saturday: { isOpen: true, start: '09:00', end: '17:00' }
          },
          services: clinic.services || []
        })
      } else {
        // Adding new clinic - reset to defaults
        setFormData({
          name: '',
          address: {
            street: '',
            city: ''
          },
          phone: {
            countryCode: '+970',
            number: ''
          },
          email: '',
          website: '',
          description: '',
          registrationNumber: '',
          password: '',
          workingHours: {
            sunday: { isOpen: true, start: '09:00', end: '17:00' },
            monday: { isOpen: true, start: '09:00', end: '17:00' },
            tuesday: { isOpen: true, start: '09:00', end: '17:00' },
            wednesday: { isOpen: true, start: '09:00', end: '17:00' },
            thursday: { isOpen: true, start: '09:00', end: '17:00' },
            friday: { isOpen: false, start: '09:00', end: '17:00' },
            saturday: { isOpen: true, start: '09:00', end: '17:00' }
          },
          services: []
        })
      }
      setErrors({})
    }
  }, [isOpen, clinic])

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
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleServiceToggle = (serviceValue) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceValue)
        ? prev.services.filter(s => s !== serviceValue)
        : [...prev.services, serviceValue]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Clinic name is required'
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required'
    }

    if (!formData.address.city) {
      newErrors['address.city'] = 'City is required'
    }

    if (!formData.phone.number.trim()) {
      newErrors['phone.number'] = 'Phone number is required'
    } else if (!/^\d{7,}$/.test(formData.phone.number)) {
      newErrors['phone.number'] = 'Phone number must contain at least 7 digits'
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)'
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
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const url = clinic 
        ? `http://localhost:5000/api/clinics/${clinic._id}`
        : 'http://localhost:5000/api/clinics'
      
      const method = clinic ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onSave(data.data, clinic ? 'updated' : 'created')
        onClose()
      } else {
        // Handle specific validation errors
        if (response.status === 400 && data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.message || 'An error occurred while saving the clinic' })
        }
      }
    } catch (error) {
      console.error('Error saving clinic:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({ general: 'Unable to connect to server. Please check if the server is running.' })
      } else {
        setErrors({ general: 'Network error. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <FaHospital className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                {clinic ? 'Edit Clinic' : 'Add New Clinic'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form Container with Scroll */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter clinic name"
                    error={errors.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <Input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    placeholder="Enter registration number"
                    error={errors.registrationNumber}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <Input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      placeholder="Enter street address"
                      error={errors['address.street']}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a city</option>
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>{city.label}</option>
                      ))}
                    </select>
                    {errors['address.city'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <FaPhone className="w-5 h-5 text-teal-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="flex">
                      <select
                        value={formData.phone.countryCode}
                        onChange={(e) => handleInputChange('phone.countryCode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                      >
                        <option value="+970">+970</option>
                        <option value="+972">+972</option>
                        <option value="+962">+962</option>
                      </select>
                      <Input
                        type="text"
                        value={formData.phone.number}
                        onChange={(e) => handleInputChange('phone.number', e.target.value.replace(/\D/g, ''))}
                        placeholder="123456789"
                        className="rounded-l-none"
                        error={errors['phone.number']}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="clinic@example.com"
                      error={errors.email}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {!clinic && '*'}
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder={clinic ? "Enter new password (optional)" : "Enter password"}
                      error={errors.password}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.clinic.com"
                      error={errors.website}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the clinic"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableServices.map(service => (
                    <label key={service.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.value)}
                        onChange={() => handleServiceToggle(service.value)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2 mb-4">
                  <FaClock className="w-5 h-5 text-teal-600" />
                  Working Hours
                </h3>
                
                <div className="space-y-3">
                  {Object.keys(dayNames).map(day => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.workingHours[day].isOpen}
                            onChange={(e) => handleWorkingHoursChange(day, 'isOpen', e.target.checked)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{dayNames[day]}</span>
                        </label>
                      </div>
                      
                      {formData.workingHours[day].isOpen && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={formData.workingHours[day].start}
                            onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={formData.workingHours[day].end}
                            onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      
                      {!formData.workingHours[day].isOpen && (
                        <span className="text-sm text-gray-500 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : (clinic ? 'Update Clinic' : 'Add Clinic')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicModal