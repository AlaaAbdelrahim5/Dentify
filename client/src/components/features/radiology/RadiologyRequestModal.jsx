import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { RADIOLOGY_STATUS_OPTIONS } from '../../../utils/constants'
import { FaTimes, FaSave, FaXRay, FaCalendarAlt, FaUser, FaHospital, FaStickyNote, FaStethoscope } from 'react-icons/fa'
import { Button, Input, Select, BaseModal } from '../../common'

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
    imagingType: '',
    status: 'Requested',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [filteredTreatments, setFilteredTreatments] = useState([])
  const [availableImagingTypes, setAvailableImagingTypes] = useState([])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        setFormData({
          patientId: initialData.patientId || '',
          radiologyCenterId: initialData.radiologyCenterId || '',
          treatmentId: initialData.treatmentId || '',
          imagingType: initialData.imagingType || '',
          status: initialData.status || 'Requested',
          notes: initialData.notes || ''
        })
        // Filter treatments for this patient
        if (initialData.patientId && treatments) {
          setFilteredTreatments(treatments.filter(t => t.patientId.toString() === initialData.patientId.toString()))
        }
        // Filter imaging types for selected radiology center
        if (initialData.radiologyCenterId && radiologyCenters) {
          const selectedCenter = radiologyCenters.find(rc => rc.id.toString() === initialData.radiologyCenterId.toString())
          setAvailableImagingTypes(selectedCenter?.supportedTypes || [])
        }
      } else {
        // New request mode
        setFormData({
          patientId: patientInfo?.id || '',
          radiologyCenterId: '',
          treatmentId: treatmentInfo?.id || '',
          imagingType: '',
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
  }, [isOpen, initialData, patientInfo, treatmentInfo, treatments, radiologyCenters])

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
    
    // If radiology center changes, filter imaging types and reset imaging type selection
    if (name === 'radiologyCenterId') {
      setFormData(prev => ({
        ...prev,
        imagingType: '' // Reset imaging type when center changes
      }))
      
      if (value && radiologyCenters) {
        const selectedCenter = radiologyCenters.find(rc => rc.id.toString() === value.toString())
        setAvailableImagingTypes(selectedCenter?.supportedTypes || [])
      } else {
        setAvailableImagingTypes([])
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
      imagingType: '',
      status: 'Requested',
      notes: ''
    })
    setErrors({})
    setFilteredTreatments([])
    setAvailableImagingTypes([])
    onClose()
  }

  if (!isOpen) return null

  // Build imaging types options based on selected radiology center
  const imagingTypesOptions = availableImagingTypes.length > 0
    ? availableImagingTypes.map(type => ({ value: type, label: type }))
    : []

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <FaXRay className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {initialData ? 'Edit Radiology Request' : 'New Radiology Request'}
            </div>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Request diagnostic imaging
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Patient Selection */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${
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
              <p className="text-red-500 text-xs mt-1">{errors.patientId}</p>
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
            <label className={`block text-xs font-medium mb-1.5 ${
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
              <p className="text-red-500 text-xs mt-1">{errors.radiologyCenterId}</p>
            )}
          </div>

          {/* Treatment (Optional) */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Related Treatment (Optional)
            </label>
            <div className="relative">
              <FaStethoscope className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                name="treatmentId"
                value={formData.treatmentId}
                onChange={handleChange}
                disabled={!!treatmentInfo || !formData.patientId}
                className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg ${
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
                    {t.treatmentName} {t.date ? `(${new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {treatmentInfo && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected to treatment plan: {treatmentInfo.treatmentName}
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

          {/* Imaging Type */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Imaging Type <span className="text-red-500">*</span>
            </label>
            <Select
              name="imagingType"
              value={formData.imagingType}
              onChange={handleChange}
              disabled={!formData.radiologyCenterId}
              options={[
                { value: '', label: formData.radiologyCenterId ? 'Select imaging type' : 'Select a radiology center first' },
                ...imagingTypesOptions
              ]}
            />
            {errors.imagingType && (
              <p className="text-red-500 text-xs mt-1">{errors.imagingType}</p>
            )}
            {!formData.radiologyCenterId && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Select a radiology center to see available types
              </p>
            )}
            {formData.radiologyCenterId && availableImagingTypes.length === 0 && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No imaging types available for this center
              </p>
            )}
          </div>

          {/* Status (only show for edit mode) */}
          {initialData && (
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Status
              </label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={RADIOLOGY_STATUS_OPTIONS}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Note: Available Date and Report can only be set by Radiology Center
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional notes or special instructions..."
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
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
    </BaseModal>
  )
}

export default RadiologyRequestModal
