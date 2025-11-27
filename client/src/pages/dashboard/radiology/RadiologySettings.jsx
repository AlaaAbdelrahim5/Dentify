import { useState, useEffect } from 'react'
import { FaHospital, FaSave, FaGlobe, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { Card, Button, Input } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const RadiologySettings = ({ radiologyData, onUpdate }) => {
  const { isDarkMode } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    centerName: '',
    registrationNumber: '',
    website: '',
    city: '',
    location: '',
    description: '',
    supportedTypes: []
  })
  const [newType, setNewType] = useState('')

  useEffect(() => {
    if (radiologyData) {
      setFormData({
        centerName: radiologyData.centerName || '',
        registrationNumber: radiologyData.registrationNumber || '',
        website: radiologyData.website || '',
        city: radiologyData.city || '',
        location: radiologyData.location || '',
        description: radiologyData.description || '',
        supportedTypes: radiologyData.supportedTypes || []
      })
    }
  }, [radiologyData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddType = () => {
    if (newType && !formData.supportedTypes.includes(newType)) {
      setFormData(prev => ({
        ...prev,
        supportedTypes: [...prev.supportedTypes, newType]
      }))
      setNewType('')
    }
  }

  const handleRemoveType = (typeToRemove) => {
    setFormData(prev => ({
      ...prev,
      supportedTypes: prev.supportedTypes.filter(type => type !== typeToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/radiology-centers/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Settings updated successfully')
        setIsEditing(false)
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      setError('An error occurred while updating settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
          {success}
        </div>
      )}

      {/* Center Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FaHospital className="text-blue-600" />
            Center Information
          </h3>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Information
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Center Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Center Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="centerName"
              value={formData.centerName}
              onChange={handleChange}
              disabled={!isEditing}
              required
              icon={FaHospital}
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Website
            </label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="https://example.com"
              icon={FaGlobe}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
              required
              icon={FaMapMarkerAlt}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Address/Location
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Full address"
              icon={FaMapMarkerAlt}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows="4"
              placeholder="Describe your radiology center..."
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Supported Imaging Types */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Supported Imaging Types
            </label>
            <div className="space-y-3">
              {/* Display existing types */}
              <div className="flex flex-wrap gap-2">
                {formData.supportedTypes.map((type, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isDarkMode
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {type}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveType(type)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add new type */}
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="e.g., X-ray, CT, MRI, 3D Imaging"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddType()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddType}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setError('')
                  setSuccess('')
                  // Reset form data
                  if (radiologyData) {
                    setFormData({
                      centerName: radiologyData.centerName || '',
                      registrationNumber: radiologyData.registrationNumber || '',
                      website: radiologyData.website || '',
                      city: radiologyData.city || '',
                      location: radiologyData.location || '',
                      description: radiologyData.description || '',
                      supportedTypes: radiologyData.supportedTypes || []
                    })
                  }
                }}
                variant="secondary"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <FaSave />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}

export default RadiologySettings
