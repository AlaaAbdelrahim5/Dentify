import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FaTimes, FaSave, FaXRay, FaCalendarAlt, FaUser, FaHospital, FaStickyNote, FaStethoscope } from 'react-icons/fa'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'

const RadiologyRequestModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  patients = [],
  radiologyCenters = [],
  treatments = [],
  initialData = null,
  patientInfo = null,
  treatmentInfo = null
}) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    patientId: '',
    radiologyCenterId: '',
    treatmentId: '',
    requestDate: new Date().toISOString().split('T')[0],
    imagingType: 'X-ray',
    status: 'Requested',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [filteredTreatments, setFilteredTreatments] = useState([])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        setFormData({
          patientId: initialData.patientId || '',
          radiologyCenterId: initialData.radiologyCenterId || '',
          treatmentId: initialData.treatmentId || '',
          requestDate: initialData.requestDate || new Date().toISOString().split('T')[0],
          imagingType: initialData.imagingType || 'X-ray',
          status: initialData.status || 'Requested',
          notes: initialData.notes || ''
        })
        // Filter treatments for this patient
        if (initialData.patientId && treatments) {
          setFilteredTreatments(treatments.filter(t => t.patientId.toString() === initialData.patientId.toString()))
        }
      } else {
        // New request mode
        setFormData({
          patientId: patientInfo?.id || '',
          radiologyCenterId: '',
          treatmentId: treatmentInfo?.id || '',
          requestDate: new Date().toISOString().split('T')[0],
          imagingType: 'X-ray',
          status: 'Requested',
          notes: ''
        })
        // Filter treatments for prefilled patient
        if (patientInfo?.id && treatments) {
          setFilteredTreatments(treatments.filter(t => t.patientId.toString() === patientInfo.id.toString()))
        }
      }
      setErrors({})
    }
  }, [isOpen, initialData, patientInfo, treatmentInfo, treatments])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // If patient changes, filter treatments and reset treatment selection
    if (name === 'patientId') {
      setFormData(prev => ({
        ...prev,
        treatmentId: '' // Reset treatment when patient changes
      }))
      
      if (value && treatments) {
        setFilteredTreatments(treatments.filter(t => t.patientId.toString() === value.toString()))
      } else {
        setFilteredTreatments([])
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
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
      treatmentId: '',
      requestDate: new Date().toISOString().split('T')[0],
      imagingType: 'X-ray',
      status: 'Requested',
      notes: ''
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

          {/* Treatment (Optional) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Related Treatment (Optional)
            </label>
            <div className="relative">
              <FaStethoscope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                name="treatmentId"
                value={formData.treatmentId}
                onChange={handleChange}
                disabled={!!treatmentInfo || !formData.patientId}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${(treatmentInfo || !formData.patientId) ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!formData.patientId ? 'Select a patient first' : 'No related treatment'}
                </option>
                {filteredTreatments && filteredTreatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.treatmentType} {t.date ? `(${new Date(t.date).toLocaleDateString()})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {treatmentInfo && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected to treatment plan: {treatmentInfo.treatmentType}
              </p>
            )}
            {!formData.patientId && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Select a patient to see their treatments
              </p>
            )}
            {formData.patientId && filteredTreatments.length === 0 && !treatmentInfo && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No treatments found for this patient
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Note: Available Date and Report File can only be set by Radiology Center
              </p>
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
