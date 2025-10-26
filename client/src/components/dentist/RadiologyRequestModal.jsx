import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FaTimes, FaSave, FaXRay, FaCalendarAlt, FaUser, FaHospital, FaStickyNote, FaFileUpload } from 'react-icons/fa'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'

const RadiologyRequestModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  patients = [],
  radiologyCenters = [],
  initialData = null,
  patientInfo = null
}) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    patientId: '',
    radiologyCenterId: '',
    requestDate: new Date().toISOString().split('T')[0],
    imagingType: 'X-ray',
    status: 'Requested',
    notes: '',
    reportFile: null
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        setFormData({
          patientId: initialData.patientId || '',
          radiologyCenterId: initialData.radiologyCenterId || '',
          requestDate: initialData.requestDate || new Date().toISOString().split('T')[0],
          imagingType: initialData.imagingType || 'X-ray',
          status: initialData.status || 'Requested',
          notes: initialData.notes || '',
          reportFile: null
        })
      } else {
        // New request mode
        setFormData({
          patientId: patientInfo?.id || '',
          radiologyCenterId: '',
          requestDate: new Date().toISOString().split('T')[0],
          imagingType: 'X-ray',
          status: 'Requested',
          notes: '',
          reportFile: null
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData, patientInfo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          reportFile: 'Please upload a PDF or image file'
        }))
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          reportFile: 'File size must be less than 10MB'
        }))
        return
      }
      setFormData(prev => ({
        ...prev,
        reportFile: file
      }))
      if (errors.reportFile) {
        setErrors(prev => ({
          ...prev,
          reportFile: ''
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient'
    }

    if (!formData.radiologyCenterId) {
      newErrors.radiologyCenterId = 'Please select a radiology center'
    }

    if (!formData.requestDate) {
      newErrors.requestDate = 'Request date is required'
    }

    if (!formData.imagingType) {
      newErrors.imagingType = 'Imaging type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      patientId: '',
      radiologyCenterId: '',
      requestDate: new Date().toISOString().split('T')[0],
      imagingType: 'X-ray',
      status: 'Requested',
      notes: '',
      reportFile: null
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const imagingTypes = [
    { value: 'X-ray', label: 'X-ray' },
    { value: 'Panoramic X-ray', label: 'Panoramic X-ray' },
    { value: 'CBCT', label: 'CBCT (Cone Beam CT)' },
    { value: 'CT Scan', label: 'CT Scan' },
    { value: '3D Imaging', label: '3D Imaging' },
    { value: 'Cephalometric', label: 'Cephalometric' },
    { value: 'Periapical', label: 'Periapical' },
    { value: 'Bitewing', label: 'Bitewing' }
  ]

  const statusOptions = [
    { value: 'Requested', label: 'Requested' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

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
          className={`relative rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${
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
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <FaXRay className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {initialData ? 'Edit Radiology Request' : 'New Radiology Request'}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Request diagnostic imaging for patient
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Patient <span className="text-red-500">*</span>
            </label>
            <Select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              disabled={!!patientInfo}
              options={[
                { value: '', label: 'Select a patient' },
                ...patients.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
            {patientInfo && (
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Selected: {patientInfo.name}
              </p>
            )}
          </div>

          {/* Radiology Center */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Radiology Center <span className="text-red-500">*</span>
            </label>
            <Select
              name="radiologyCenterId"
              value={formData.radiologyCenterId}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select a radiology center' },
                ...radiologyCenters.map(rc => ({ value: rc.id, label: rc.name }))
              ]}
            />
            {errors.radiologyCenterId && (
              <p className="text-red-500 text-sm mt-1">{errors.radiologyCenterId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imaging Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Imaging Type <span className="text-red-500">*</span>
              </label>
              <Select
                name="imagingType"
                value={formData.imagingType}
                onChange={handleChange}
                options={imagingTypes}
              />
              {errors.imagingType && (
                <p className="text-red-500 text-sm mt-1">{errors.imagingType}</p>
              )}
            </div>

            {/* Request Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Request Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleChange}
                icon={FaCalendarAlt}
              />
              {errors.requestDate && (
                <p className="text-red-500 text-sm mt-1">{errors.requestDate}</p>
              )}
            </div>
          </div>

          {/* Status (only show for edit mode) */}
          {initialData && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Status
              </label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />
            </div>
          )}

          {/* Report File Upload (only for edit mode or completed status) */}
          {(initialData || formData.status === 'Completed') && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Report File (PDF or Image)
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 ${
                isDarkMode 
                  ? 'border-gray-600 hover:border-purple-500' 
                  : 'border-gray-300 hover:border-purple-400'
              } transition-colors`}>
                <input
                  type="file"
                  id="reportFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="reportFile"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FaFileUpload className={`w-8 h-8 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {formData.reportFile 
                      ? formData.reportFile.name 
                      : 'Click to upload report file'
                    }
                  </span>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    PDF, JPG, PNG (Max 10MB)
                  </span>
                </label>
              </div>
              {errors.reportFile && (
                <p className="text-red-500 text-sm mt-1">{errors.reportFile}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Add any additional notes or special instructions..."
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {initialData ? 'Update Request' : 'Create Request'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default RadiologyRequestModal
