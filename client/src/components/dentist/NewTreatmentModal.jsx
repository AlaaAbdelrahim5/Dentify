import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FaTimes, FaSave, FaTooth, FaCalendarAlt, FaDollarSign, FaStethoscope, FaPlus, FaTrash, FaExclamationTriangle, FaUser, FaStickyNote } from 'react-icons/fa'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import ToothChart from './ToothChart'
import { Card } from '../index'
import NewAppointmentModal from './NewAppointmentModal'

const NewTreatmentModal = ({
  isOpen,
  onClose,
  onSave,
  patients = [],
  initialData = null,
  asFullPage = false // New prop to render as full page instead of modal
}) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('basic') // basic, teeth, steps, payment
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [selectedStepForAppointment, setSelectedStepForAppointment] = useState(null)
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
      setActiveTab('basic')
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
            status: 'cavity',
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

  const handleBookAppointmentForStep = (step, index) => {
    setSelectedStepForAppointment({ step, index })
    setIsAppointmentModalOpen(true)
  }

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false)
    setSelectedStepForAppointment(null)
  }

  const handleSaveAppointment = (appointmentData) => {
    console.log('Appointment saved for step:', selectedStepForAppointment)
    console.log('Appointment data:', appointmentData)
    
    // Update the step's date with the appointment date
    if (selectedStepForAppointment && appointmentData.appointmentDate) {
      handleUpdateStep(selectedStepForAppointment.index, 'date', appointmentData.appointmentDate)
    }
    
    handleCloseAppointmentModal()
    // You can add additional logic here to save the appointment to your backend
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
    { value: 'healthy', label: 'Healthy' },
    { value: 'cavity', label: 'Cavity' },
    { value: 'root-canal', label: 'Root Canal' },
    { value: 'crown', label: 'Crown' },
    { value: 'extracted', label: 'Extracted' },
    { value: 'implant', label: 'Implant' },
    { value: 'filling', label: 'Filling' },
    { value: 'bridge', label: 'Bridge' }
  ]

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ]

  // Main content
  const content = (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
          }`}>
            <FaStethoscope className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {initialData ? 'Edit Treatment Plan' : 'New Treatment Plan'}
            </h2>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {initialData ? 'Update treatment details' : 'Create a comprehensive treatment plan'}
            </p>
          </div>
        </div>
        {!asFullPage && (
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-600 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Tabs Navigation */}
        <div className={`flex gap-1 p-3 border-b ${
          isDarkMode ? 'border-gray-600 bg-gray-600/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'basic'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <FaUser className="w-3.5 h-3.5" />
              Basic Info
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teeth')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'teeth'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <FaTooth className="w-3.5 h-3.5" />
              Teeth
              {selectedTeeth.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {selectedTeeth.length}
                </span>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'steps'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <FaStethoscope className="w-3.5 h-3.5" />
              Treatment Steps
              {treatmentSteps.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {treatmentSteps.length}
                </span>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'payment'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <FaDollarSign className="w-3.5 h-3.5" />
              Payment
            </div>
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className={`flex-1 overflow-y-auto p-5 ${
          isDarkMode ? 'bg-gray-600/20' : 'bg-gray-50'
        }`}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Patient Selection */}
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-base flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <FaUser className="w-4 h-4 text-teal-500" />
                    Patient Information
                  </h3>
                </Card.Header>
                <Card.Content>
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Select Patient <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'Choose a patient...' },
                        ...patients.map(p => ({ value: p.id, label: p.name }))
                      ]}
                    />
                    {errors.patientId && (
                      <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
                    )}
                  </div>
                </Card.Content>
              </Card>

              {/* Treatment Details */}
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-base flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <FaStethoscope className="w-4 h-4 text-teal-500" />
                    Treatment Details
                  </h3>
                </Card.Header>
                <Card.Content className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${
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
                      <label className={`block text-xs font-medium mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Priority Level
                      </label>
                      <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        options={[
                          { value: 'Low', label: '🟢 Low Priority' },
                          { value: 'Medium', label: '🟡 Medium Priority' },
                          { value: 'High', label: '🔴 High Priority' }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status
                      </label>
                      <Select
                        name="treatmentStatus"
                        value={formData.treatmentStatus}
                        onChange={handleChange}
                        options={statusOptions}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Start Date
                      </label>
                      <Input
                        type="date"
                        name="creationDate"
                        value={formData.creationDate}
                        onChange={handleChange}
                        icon={FaCalendarAlt}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Describe the treatment plan and procedures..."
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                    />
                  </div>
                </Card.Content>
              </Card>

              {/* Notes */}
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-base flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <FaStickyNote className="w-4 h-4 text-yellow-500" />
                    Clinical Notes
                  </h3>
                </Card.Header>
                <Card.Content>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add any additional clinical notes or observations..."
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                  />
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Teeth Tab */}
          {activeTab === 'teeth' && (
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <FaTooth className="w-5 h-5 text-teal-500" />
                      Select Affected Teeth
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowToothChart(!showToothChart)}
                    >
                      {showToothChart ? 'Hide' : 'Show'} Tooth Chart
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  {showToothChart && (
                    <div className="mb-6">
                      <ToothChart
                        selectedTeeth={selectedTeeth}
                        onToothSelect={handleToothSelect}
                        toothConditions={toothConditions}
                      />
                    </div>
                  )}

                  {selectedTeeth.length > 0 ? (
                    <div className="space-y-4">
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Selected Teeth: {selectedTeeth.length}
                      </p>
                      {selectedTeeth.map(toothNumber => (
                        <Card key={toothNumber} className={`border ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          <Card.Content className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`font-semibold text-lg flex items-center gap-2 ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                <FaTooth className="text-teal-500" />
                                Tooth #{toothNumber}
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleToothSelect(toothNumber)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Condition
                                </label>
                                <select
                                  value={toothConditions[toothNumber]?.status || 'cavity'}
                                  onChange={(e) => handleToothConditionChange(toothNumber, 'status', e.target.value)}
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
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
                                <label className={`text-sm font-medium ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Priority
                                </label>
                                <select
                                  value={toothConditions[toothNumber]?.priority || 'Medium'}
                                  onChange={(e) => handleToothConditionChange(toothNumber, 'priority', e.target.value)}
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
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
                              <div className="md:col-span-2">
                                <label className={`text-sm font-medium ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Notes
                                </label>
                                <input
                                  type="text"
                                  value={toothConditions[toothNumber]?.notes || ''}
                                  onChange={(e) => handleToothConditionChange(toothNumber, 'notes', e.target.value)}
                                  placeholder="Add notes for this tooth..."
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                                    isDarkMode
                                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                  }`}
                                />
                              </div>
                            </div>
                          </Card.Content>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaTooth className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No teeth selected yet
                      </p>
                      <p className={`text-sm mt-2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {showToothChart ? 'Click on teeth in the chart above to select them' : 'Show the tooth chart to select affected teeth'}
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Treatment Steps Tab */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <FaStethoscope className="w-5 h-5 text-teal-500" />
                      Treatment Plan Steps
                    </h3>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddStep}
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  {treatmentSteps.length > 0 ? (
                    <div className="space-y-4">
                      {treatmentSteps.map((step, index) => (
                        <Card key={index} className={`border-2 ${
                          step.status === 'completed' 
                            ? isDarkMode ? 'border-green-700 bg-green-900/10' : 'border-green-200 bg-green-50'
                            : step.status === 'current'
                            ? isDarkMode ? 'border-teal-700 bg-teal-900/10' : 'border-teal-200 bg-teal-50'
                            : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          <Card.Content className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className={`font-semibold text-lg ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                Step {index + 1}
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleBookAppointmentForStep(step, index)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                    isDarkMode
                                      ? 'bg-teal-900/30 text-teal-400 hover:bg-teal-900/50'
                                      : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                  }`}
                                  title="Book appointment for this step"
                                >
                                  <FaCalendarAlt className="w-3.5 h-3.5" />
                                  Book
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStep(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`text-sm font-medium ${
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
                                <label className={`text-sm font-medium ${
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
                              
                              <div>
                                <label className={`text-sm font-medium ${
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
                                <label className={`text-sm font-medium ${
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
                          </Card.Content>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaStethoscope className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No treatment steps yet
                      </p>
                      <p className={`text-sm mt-2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Click "Add Step" to create your treatment plan
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <FaDollarSign className="w-5 h-5 text-green-500" />
                    Payment Information
                  </h3>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Initial Payment
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

                  {/* Payment Summary */}
                  {formData.totalAmount && parseFloat(formData.totalAmount) > 0 && (
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Total Cost
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            ${parseFloat(formData.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Initial Payment
                          </p>
                          <p className={`text-2xl font-bold text-green-600`}>
                            ${parseFloat(formData.paidAmount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Remaining
                          </p>
                          <p className={`text-2xl font-bold ${
                            (parseFloat(formData.totalAmount || 0) - parseFloat(formData.paidAmount || 0)) > 0
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}>
                            ${(parseFloat(formData.totalAmount || 0) - parseFloat(formData.paidAmount || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        {!asFullPage && (
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                className="flex-1"
              >
                <FaSave className="w-3.5 h-3.5 mr-2" />
                {initialData ? 'Update Treatment' : 'Create Treatment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    )

  // Wrap content in modal backdrop if not full page
  if (asFullPage) {
    return (
      <>
        {content}
        {/* Appointment Modal for Steps */}
        <NewAppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          onSave={handleSaveAppointment}
          patients={patients}
          prefilledData={
            selectedStepForAppointment && formData.patientId
              ? {
                  patientId: formData.patientId,
                  appointmentDate: selectedStepForAppointment.step.date || '',
                  reason: `${formData.treatmentType} - ${selectedStepForAppointment.step.title || `Step ${selectedStepForAppointment.index + 1}`}`,
                  notes: selectedStepForAppointment.step.notes || ''
                }
              : null
          }
        />
      </>
    )
  }

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    </div>

    {/* Appointment Modal for Steps */}
    <NewAppointmentModal
      isOpen={isAppointmentModalOpen}
      onClose={handleCloseAppointmentModal}
      onSave={handleSaveAppointment}
      patients={patients}
      prefilledData={
        selectedStepForAppointment && formData.patientId
          ? {
              patientId: formData.patientId,
              appointmentDate: selectedStepForAppointment.step.date || '',
              reason: `${formData.treatmentType} - ${selectedStepForAppointment.step.title || `Step ${selectedStepForAppointment.index + 1}`}`,
              notes: selectedStepForAppointment.step.notes || ''
            }
          : null
      }
    />
    </>
  )
}

export default NewTreatmentModal
