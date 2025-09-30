import { useState, useEffect } from 'react'
import { 
  FaTimes, 
  FaXRay, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaGlobe,
  FaClock,
  FaSave
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'

const RadiologyModal = ({ isOpen, onClose, center = null, onSave }) => {
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
    workingHours: {
      sunday: { isOpen: true, start: '09:00', end: '17:00' },
      monday: { isOpen: true, start: '09:00', end: '17:00' },
      tuesday: { isOpen: true, start: '09:00', end: '17:00' },
      wednesday: { isOpen: true, start: '09:00', end: '17:00' },
      thursday: { isOpen: true, start: '09:00', end: '17:00' },
      friday: { isOpen: false, start: '09:00', end: '17:00' },
      saturday: { isOpen: true, start: '09:00', end: '17:00' }
    },
    services: [],
    equipment: []
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
    { value: 'panoramic_xray', label: 'Panoramic X-Ray' },
    { value: 'periapical_xray', label: 'Periapical X-Ray' },
    { value: 'bitewing_xray', label: 'Bitewing X-Ray' },
    { value: 'cephalometric_xray', label: 'Cephalometric X-Ray' },
    { value: 'ct_scan', label: 'CT Scan' },
    { value: 'cbct', label: 'CBCT (Cone Beam CT)' },
    { value: 'mri', label: 'MRI' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'digital_imaging', label: 'Digital Imaging' },
    { value: 'tmj_imaging', label: 'TMJ Imaging' }
  ]

  const availableEquipment = [
    { value: 'digital_xray_machine', label: 'Digital X-Ray Machine' },
    { value: 'panoramic_machine', label: 'Panoramic Machine' },
    { value: 'cephalometric_machine', label: 'Cephalometric Machine' },
    { value: 'cbct_scanner', label: 'CBCT Scanner' },
    { value: 'ct_scanner', label: 'CT Scanner' },
    { value: 'mri_machine', label: 'MRI Machine' },
    { value: 'ultrasound_machine', label: 'Ultrasound Machine' },
    { value: 'intraoral_camera', label: 'Intraoral Camera' },
    { value: 'film_processor', label: 'Film Processor' },
    { value: 'lead_aprons', label: 'Lead Aprons' }
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

  // Reset form when modal opens/closes or center changes
  useEffect(() => {
    if (isOpen) {
      if (center) {
        // Editing existing center
        setFormData({
          name: center.name || '',
          address: {
            street: center.address?.street || '',
            city: center.address?.city || ''
          },
          phone: {
            countryCode: center.phone?.countryCode || '+970',
            number: center.phone?.number || ''
          },
          email: center.email || '',
          website: center.website || '',
          description: center.description || '',
          registrationNumber: center.registrationNumber || '',
          workingHours: center.workingHours || {
            sunday: { isOpen: true, start: '09:00', end: '17:00' },
            monday: { isOpen: true, start: '09:00', end: '17:00' },
            tuesday: { isOpen: true, start: '09:00', end: '17:00' },
            wednesday: { isOpen: true, start: '09:00', end: '17:00' },
            thursday: { isOpen: true, start: '09:00', end: '17:00' },
            friday: { isOpen: false, start: '09:00', end: '17:00' },
            saturday: { isOpen: true, start: '09:00', end: '17:00' }
          },
          services: center.services || [],
          equipment: center.equipment || []
        })
      } else {
        // Adding new center - reset to defaults
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
          workingHours: {
            sunday: { isOpen: true, start: '09:00', end: '17:00' },
            monday: { isOpen: true, start: '09:00', end: '17:00' },
            tuesday: { isOpen: true, start: '09:00', end: '17:00' },
            wednesday: { isOpen: true, start: '09:00', end: '17:00' },
            thursday: { isOpen: true, start: '09:00', end: '17:00' },
            friday: { isOpen: false, start: '09:00', end: '17:00' },
            saturday: { isOpen: true, start: '09:00', end: '17:00' }
          },
          services: [],
          equipment: []
        })
      }
      setErrors({})
    }
  }, [isOpen, center])

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

  const handleEquipmentToggle = (equipmentValue) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentValue)
        ? prev.equipment.filter(e => e !== equipmentValue)
        : [...prev.equipment, equipmentValue]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Center name is required'
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
      
      const url = center 
        ? `http://localhost:5000/api/radiology-centers/${center._id}`
        : 'http://localhost:5000/api/radiology-centers'
      
      const method = center ? 'PUT' : 'POST'

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
        onSave(data.data, center ? 'updated' : 'created')
        onClose()
      } else {
        // Handle specific validation errors
        if (response.status === 400 && data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.message || 'An error occurred while saving the center' })
        }
      }
    } catch (error) {
      console.error('Error saving center:', error)
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
              <FaXRay className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                {center ? 'Edit Radiology Center' : 'Add New Radiology Center'}
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Center Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter center name"
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

              {/* Address Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                        errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
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
                <div className="flex items-center gap-2 mb-4">
                  <FaPhone className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="flex">
                      <select
                        value={formData.phone.countryCode}
                        onChange={(e) => handleInputChange('phone.countryCode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="+970">+970</option>
                        <option value="+972">+972</option>
                        <option value="+962">+962</option>
                        <option value="+961">+961</option>
                      </select>
                      <Input
                        type="tel"
                        value={formData.phone.number}
                        onChange={(e) => handleInputChange('phone.number', e.target.value)}
                        placeholder="599888152"
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
                      placeholder="center@example.com"
                      error={errors.email}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
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
                  placeholder="Brief description of the radiology center..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Services Offered */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Offered</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableServices.map((service) => (
                    <label key={service.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.value)}
                        onChange={() => handleServiceToggle(service.value)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Equipment</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableEquipment.map((equipment) => (
                    <label key={equipment.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.equipment.includes(equipment.value)}
                        onChange={() => handleEquipmentToggle(equipment.value)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{equipment.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaClock className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Working Hours</h3>
                </div>
                <div className="space-y-3">
                  {Object.keys(dayNames).map((day) => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <span className="font-medium text-gray-700">{dayNames[day]}</span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.workingHours[day].isOpen}
                          onChange={(e) => handleWorkingHoursChange(day, 'isOpen', e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-2"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                      {formData.workingHours[day].isOpen && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={formData.workingHours[day].start}
                            onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={formData.workingHours[day].end}
                            onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
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
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                  {center ? 'Update Center' : 'Create Center'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RadiologyModal