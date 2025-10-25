import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FaTimes, FaSave, FaTooth, FaCalendarAlt, FaDollarSign, FaStethoscope, FaPlus, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import ToothChart from './ToothChart'

const NewTreatmentModal = ({
  isOpen,
  onClose,
  onSave,
  patients = [],
  initialData = null
}) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    patientId: '',
    treatmentType: '',
    description: '',
    treatmentStatus: 'In Progress',
    creationDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    paidAmount: '0',
    notes: '',
    priority: 'Medium'
  })
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [toothConditions, setToothConditions] = useState({})
  const [showToothChart, setShowToothChart] = useState(false)
  const [treatmentSteps, setTreatmentSteps] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          patientId: initialData.patientId || '',
          treatmentType: initialData.treatmentType || '',
          description: initialData.description || '',
          treatmentStatus: initialData.treatmentStatus || 'In Progress',
          creationDate: initialData.creationDate || new Date().toISOString().split('T')[0],
          totalAmount: initialData.totalAmount?.toString() || '',
          paidAmount: initialData.paidAmount?.toString() || '0',
          notes: initialData.notes || '',
          priority: initialData.priority || 'Medium'
        })
        setSelectedTeeth(initialData.teethStatus?.map(t => t.toothNumber) || [])
        const conditions = {}
        initialData.teethStatus?.forEach(tooth => {
          conditions[tooth.toothNumber] = {
            status: tooth.conditionStatus,
            priority: tooth.treatmentPriority,
            diagnosedDate: tooth.diagnosedDate,
            notes: tooth.notes
          }
        })
        setToothConditions(conditions)
        setTreatmentSteps(initialData.steps || [])
      } else {
        setFormData({
          patientId: '',
          treatmentType: '',
          description: '',
          treatmentStatus: 'In Progress',
          creationDate: new Date().toISOString().split('T')[0],
          totalAmount: '',
          paidAmount: '0',
          notes: '',
          priority: 'Medium'
        })
        setSelectedTeeth([])
        setToothConditions({})
        setTreatmentSteps([
          { title: 'Diagnosis', status: 'current', date: new Date().toISOString().split('T')[0], notes: '' },
          { title: 'Treatment Planning', status: 'upcoming', date: '', notes: '' },
          { title: 'Treatment Execution', status: 'upcoming', date: '', notes: '' },
          { title: 'Follow-up', status: 'upcoming', date: '', notes: '' }
        ])
      }
      setErrors({})
      setShowToothChart(false)
    }
  }, [isOpen, initialData])

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

  const handleToothSelect = (toothNumber) => {
    setSelectedTeeth(prev => {
      if (prev.includes(toothNumber)) {
        const newTeeth = prev.filter(t => t !== toothNumber)
        setToothConditions(prevConditions => {
          const newConditions = { ...prevConditions }
          delete newConditions[toothNumber]
          return newConditions
        })
        return newTeeth
      } else {
        setToothConditions(prev => ({
          ...prev,
          [toothNumber]: {
            status: 'Cavity',
            priority: 'Medium',
            diagnosedDate: new Date().toISOString().split('T')[0],
            notes: ''
          }
        }))
        return [...prev, toothNumber]
      }
    })
  }

  const handleToothConditionChange = (toothNumber, field, value) => {
    setToothConditions(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        [field]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient'
    }

    if (!formData.treatmentType.trim()) {
      newErrors.treatmentType = 'Treatment type is required'
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Please enter a valid total amount'
    }

    if (parseFloat(formData.paidAmount) < 0) {
      newErrors.paidAmount = 'Paid amount cannot be negative'
    }

    if (parseFloat(formData.paidAmount) > parseFloat(formData.totalAmount)) {
      newErrors.paidAmount = 'Paid amount cannot exceed total amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const teethStatus = selectedTeeth.map(toothNumber => ({
        toothNumber,
        conditionStatus: toothConditions[toothNumber]?.status || 'Cavity',
        treatmentPriority: toothConditions[toothNumber]?.priority || 'Medium',
        diagnosedDate: toothConditions[toothNumber]?.diagnosedDate || new Date().toISOString().split('T')[0],
        notes: toothConditions[toothNumber]?.notes || ''
      }))

      const treatmentData = {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        teethStatus,
        steps: treatmentSteps
      }
      
      onSave(treatmentData)
      onClose()
    }
  }

  const handleAddStep = () => {
    setTreatmentSteps([...treatmentSteps, {
      title: '',
      status: 'upcoming',
      date: '',
      notes: ''
    }])
  }

  const handleUpdateStep = (index, field, value) => {
    const updated = [...treatmentSteps]
    updated[index][field] = value
    setTreatmentSteps(updated)
  }

  const handleRemoveStep = (index) => {
    setTreatmentSteps(treatmentSteps.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    setFormData({
      patientId: '',
      treatmentType: '',
      description: '',
      treatmentStatus: 'In Progress',
      creationDate: new Date().toISOString().split('T')[0],
      totalAmount: '',
      paidAmount: '0',
      notes: ''
    })
    setSelectedTeeth([])
    setToothConditions({})
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const treatmentTypes = [
    { value: '', label: 'Select treatment type' },
    { value: 'Root Canal', label: 'Root Canal' },
    { value: 'Extraction', label: 'Extraction' },
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Filling', label: 'Filling' },
    { value: 'Crown Installation', label: 'Crown Installation' },
    { value: 'Bridge', label: 'Bridge' },
    { value: 'Implant', label: 'Implant' },
    { value: 'Whitening', label: 'Whitening' },
    { value: 'Orthodontics', label: 'Orthodontics' },
    { value: 'Veneer', label: 'Veneer' },
    { value: 'Other', label: 'Other' }
  ]

  const statusOptions = [
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  const conditionOptions = [
    { value: 'Healthy', label: 'Healthy' },
    { value: 'Cavity', label: 'Cavity' },
    { value: 'Root Canal', label: 'Root Canal' },
    { value: 'Crown', label: 'Crown' },
    { value: 'Extracted', label: 'Extracted' },
    { value: 'Implant', label: 'Implant' },
    { value: 'Filling', label: 'Filling' },
    { value: 'Bridge', label: 'Bridge' }
  ]

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-5xl rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
            }`}>
              <FaStethoscope className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {initialData ? 'Edit Treatment Plan' : 'New Treatment Plan'}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Create a comprehensive treatment plan
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              options={[
                { value: '', label: 'Select a patient' },
                ...patients.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Treatment Type <span className="text-red-500">*</span>
              </label>
              <Select
                name="treatmentType"
                value={formData.treatmentType}
                onChange={handleChange}
                options={treatmentTypes}
              />
              {errors.treatmentType && (
                <p className="text-red-500 text-sm mt-1">{errors.treatmentType}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Treatment Priority
              </label>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'Low', label: 'Low Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'High', label: 'High Priority' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Treatment Status
            </label>
            <Select
              name="treatmentStatus"
              value={formData.treatmentStatus}
              onChange={handleChange}
              options={statusOptions}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the treatment plan..."
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Creation Date
              </label>
              <Input
                type="date"
                name="creationDate"
                value={formData.creationDate}
                onChange={handleChange}
                icon={FaCalendarAlt}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Total Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                icon={FaDollarSign}
              />
              {errors.totalAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Paid Amount
              </label>
              <Input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                icon={FaDollarSign}
              />
              {errors.paidAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.paidAmount}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Affected Teeth (Optional)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowToothChart(!showToothChart)}
              >
                <FaTooth className="w-4 h-4 mr-2" />
                {showToothChart ? 'Hide' : 'Show'} Tooth Chart
              </Button>
            </div>

            {showToothChart && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <ToothChart
                  selectedTeeth={selectedTeeth}
                  onToothSelect={handleToothSelect}
                  toothConditions={toothConditions}
                />
              </div>
            )}

            {selectedTeeth.length > 0 && (
              <div className={`mt-4 p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Selected Teeth Details ({selectedTeeth.length})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedTeeth.map(toothNumber => (
                    <div
                      key={toothNumber}
                      className={`p-3 rounded-lg border ${
                        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FaTooth className="text-teal-500" />
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          Tooth #{toothNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Condition
                          </label>
                          <select
                            value={toothConditions[toothNumber]?.status || 'Cavity'}
                            onChange={(e) => handleToothConditionChange(toothNumber, 'status', e.target.value)}
                            className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {conditionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Priority
                          </label>
                          <select
                            value={toothConditions[toothNumber]?.priority || 'Medium'}
                            onChange={(e) => handleToothConditionChange(toothNumber, 'priority', e.target.value)}
                            className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {priorityOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Notes
                        </label>
                        <input
                          type="text"
                          value={toothConditions[toothNumber]?.notes || ''}
                          onChange={(e) => handleToothConditionChange(toothNumber, 'notes', e.target.value)}
                          placeholder="Add notes..."
                          className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Treatment Steps Section */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaStethoscope className="text-teal-500 w-5 h-5" />
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Treatment Plan Steps
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStep}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {treatmentSteps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Step {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Step Title
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                        placeholder="e.g., Diagnosis, Treatment, Follow-up"
                        className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Status
                      </label>
                      <select
                        value={step.status}
                        onChange={(e) => handleUpdateStep(index, 'status', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="current">Current</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={step.date}
                        onChange={(e) => handleUpdateStep(index, 'date', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Notes
                      </label>
                      <input
                        type="text"
                        value={step.notes}
                        onChange={(e) => handleUpdateStep(index, 'notes', e.target.value)}
                        placeholder="Step notes..."
                        className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {treatmentSteps.length === 0 && (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <p>No treatment steps defined yet.</p>
                  <p className="text-sm mt-2">Click "Add Step" to create a treatment plan.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              General Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional notes..."
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
            />
          </div>

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
              className="flex-1"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {initialData ? 'Update Treatment' : 'Create Treatment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewTreatmentModal