import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { TREATMENT_STATUS_OPTIONS, PRIORITY_OPTIONS, TOOTH_CONDITION_OPTIONS } from '../../../utils/constants'
import { getTodayISO, safeJsonParse, ensureArray } from '../../../utils/helpers'
import { FaTimes, FaSave, FaTooth, FaCalendarAlt, FaDollarSign, FaStethoscope, FaPlus, FaTrash, FaExclamationTriangle, FaUser, FaStickyNote } from 'react-icons/fa'
import { Button, Input, Select, Card } from '../../common'
import ToothChart from './ToothChart'
import { dentistsAPI, clinicsAPI } from '../../../services/api'

// Reusable Section Card Component - Export for reuse
export const SectionCard = ({ icon: Icon, title, iconColor, children }) => {
  const { isDarkMode } = useTheme()
  return (
    <Card>
      <Card.Header>
        <h3 className={`font-semibold text-base flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {title}
        </h3>
      </Card.Header>
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  )
}

// Reusable Textarea Component - Export for reuse
export const TextArea = ({ name, value, onChange, rows = 3, placeholder, label }) => {
  const { isDarkMode } = useTheme()
  return (
    <div>
      {label && (
        <label className={`block text-xs font-medium mb-1.5 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
        } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
      />
    </div>
  )
}

const TreatmentModal = ({
  isOpen,
  onClose,
  onSave,
  patients = [],
  initialData = null,
  appointmentData = null, // New prop for appointment data
  asFullPage = false // New prop to render as full page instead of modal
}) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('basic') // basic, teeth
  const [formData, setFormData] = useState({
    patientId: '',
    treatmentName: '',
    description: '',
    treatmentStatus: 'In Progress',
    creationDate: getTodayISO(),
    totalAmount: '',
    paidAmount: '0',
    notes: '',
    appointmentId: '' // Add appointmentId field
  })
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [toothConditions, setToothConditions] = useState({})
  const [patientTeethHistory, setPatientTeethHistory] = useState({})
  const [showToothChart, setShowToothChart] = useState(false)
  const [errors, setErrors] = useState({})
  const [availableTreatments, setAvailableTreatments] = useState([])
  const [loadingTreatments, setLoadingTreatments] = useState(true)

  // Fetch availableTreatments from dentist's clinic
  useEffect(() => {
    const fetchAvailableTreatments = async () => {
      try {
        setLoadingTreatments(true)
        
        // Fetch dentist profile
        const response = await dentistsAPI.getMyProfile()
        console.log('Dentist profile response:', response)
        
        const dentist = response.data?.dentist || response.dentist
        console.log('Dentist data:', dentist)
        console.log('Clinic ID:', dentist?.clinicId)
        
        if (dentist?.clinicId) {
          // Fetch available treatments for the clinic
          const treatmentsResponse = await clinicsAPI.getAvailableTreatments(dentist.clinicId)
          console.log('Treatments response:', treatmentsResponse)
          
          // Extract treatments array from response
          let treatments = treatmentsResponse.data || treatmentsResponse
          console.log('Extracted treatments:', treatments)
          
          // Handle case where treatments might be a JSON string
          if (typeof treatments === 'string') {
            try {
              treatments = JSON.parse(treatments)
            } catch (e) {
              console.error('Failed to parse treatments JSON:', e)
              treatments = []
            }
          }
          
          // Ensure we have an array of treatments with name and cost properties
          if (Array.isArray(treatments) && treatments.length > 0) {
            console.log('Setting available treatments:', treatments)
            setAvailableTreatments(treatments)
          } else {
            console.log('No treatments found or invalid format')
            setAvailableTreatments([])
          }
        } else {
          console.log('No clinic ID found for dentist')
          setAvailableTreatments([])
        }
      } catch (error) {
        console.error('Error fetching available treatments:', error)
        console.error('Error details:', error.response?.data)
        setAvailableTreatments([])
      } finally {
        setLoadingTreatments(false)
      }
    }

    if (isOpen) {
      fetchAvailableTreatments()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          patientId: initialData.patientId || '',
          treatmentName: initialData.treatmentName || '',
          description: initialData.description || '',
          treatmentStatus: initialData.treatmentStatus || 'In Progress',
          creationDate: initialData.creationDate || getTodayISO(),
          totalAmount: initialData.totalAmount?.toString() || '',
          paidAmount: initialData.paidAmount?.toString() || '0',
          notes: initialData.notes || '',
          appointmentId: initialData.appointmentId || ''
        })
        setSelectedTeeth(initialData.teethStatus?.map(t => t.toothNumber) || [])
        const conditions = {}
        initialData.teethStatus?.forEach(tooth => {
          conditions[tooth.toothNumber] = {
            status: tooth.conditionStatus?.toLowerCase() || 'cavity',
            priority: tooth.priority || 'Medium',
            diagnosedDate: tooth.diagnosedDate || getTodayISO(),
            notes: tooth.notes || '',
            toothStatus: tooth.status || 'In Progress' // Track if tooth is completed
          }
        })
        setToothConditions(conditions)
      } else {
        setFormData({
          patientId: '',
          treatmentName: '',
          description: '',
          treatmentStatus: 'In Progress',
          creationDate: getTodayISO(),
          totalAmount: '',
          paidAmount: '0',
          notes: '',
          appointmentId: ''
        })
        setSelectedTeeth([])
        setToothConditions({})
      }
      setErrors({})
      setShowToothChart(false)
      setActiveTab('basic')
    }
  }, [isOpen, initialData])

  // Fetch patient's teeth history when patient is selected
  useEffect(() => {
    const fetchPatientTeethHistory = async () => {
      if (!formData.patientId || formData.patientId === '') {
        setPatientTeethHistory({})
        return
      }

      try {
        const { treatmentsAPI } = await import('../../../services/api')
        // Fetch all treatments for this patient
        const response = await treatmentsAPI.getDentistTreatments()
        const patientTreatments = response.treatments.filter(
          t => t.patientId === parseInt(formData.patientId)
        )

        // Build teeth history map
        const historyMap = {}
        patientTreatments.forEach(treatment => {
          // Parse teethStatus
          const teethStatus = typeof treatment.teethStatus === 'string'
            ? ensureArray(safeJsonParse(treatment.teethStatus, []))
            : ensureArray(treatment.teethStatus)

          teethStatus.forEach(tooth => {
            if (!historyMap[tooth.toothNumber]) {
              historyMap[tooth.toothNumber] = {
                hasHistory: true,
                conditionCount: 0,
                allConditions: []
              }
            }
            historyMap[tooth.toothNumber].conditionCount++
            historyMap[tooth.toothNumber].allConditions.push({
              status: tooth.conditionStatus?.toLowerCase() || 'cavity',
              treatment: treatment.treatmentName,
              date: treatment.createdAt,
              notes: tooth.notes
            })
          })
        })

        setPatientTeethHistory(historyMap)
      } catch (error) {
        console.error('Error fetching patient teeth history:', error)
      }
    }

    if (isOpen) {
      fetchPatientTeethHistory()
    }
  }, [formData.patientId, isOpen])

  // Handle appointment data pre-filling
  useEffect(() => {
    if (appointmentData && isOpen) {
      const apptId = appointmentData.appointmentId || appointmentData.id
      
      setFormData(prev => ({
        ...prev,
        patientId: appointmentData.patientId?.toString() || '',
        treatmentName: appointmentData.treatmentName || '',
        description: '',
        notes: appointmentData.toothNotes || '', // Pre-fill notes from tooth chart
        appointmentId: apptId
      }))
      
      // If tooth number is provided, pre-select it
      if (appointmentData.toothNumber) {
        const toothNumber = appointmentData.toothNumber
        setSelectedTeeth([toothNumber])
        setToothConditions({
          [toothNumber]: {
            status: appointmentData.toothCondition || 'cavity',
            priority: 'Medium',
            diagnosedDate: getTodayISO(),
            notes: appointmentData.toothNotes || '',
            toothStatus: 'In Progress'
          }
        })
        // Automatically switch to teeth tab when tooth is pre-selected
        setActiveTab('teeth')
      }
    }
  }, [appointmentData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If treatment name is being changed, auto-fill the cost
    if (name === 'treatmentName' && value) {
      const selectedTreatment = availableTreatments.find(t => t.name === value)
      if (selectedTreatment && !initialData) { // Only auto-fill for new treatments
        setFormData(prev => ({
          ...prev,
          [name]: value,
          totalAmount: selectedTreatment.cost.toString()
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleToothSelect = (toothNumber) => {
    // Check if this tooth is completed - if so, don't allow deletion
    const isCompleted = toothConditions[toothNumber]?.toothStatus === 'Completed'
    if (isCompleted) {
      alert('Cannot delete a completed tooth. This tooth treatment has been marked as complete.')
      return
    }
    
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
            diagnosedDate: getTodayISO(),
            notes: '',
            toothStatus: 'In Progress'
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
      setActiveTab('basic') // Switch to basic tab to show error
    }

    if (!formData.treatmentName.trim()) {
      newErrors.treatmentName = 'Treatment type is required'
      if (!newErrors.patientId) setActiveTab('basic') // Switch to basic tab if not already there
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
    
    // Show alert with all errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n')
      alert('Please fix the following errors:\n\n' + errorMessages)
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const teethStatus = selectedTeeth.map(toothNumber => ({
        toothNumber,
        conditionStatus: toothConditions[toothNumber]?.status || 'Cavity',
        priority: toothConditions[toothNumber]?.priority || 'Medium',
        diagnosedDate: toothConditions[toothNumber]?.diagnosedDate || getTodayISO(),
        notes: toothConditions[toothNumber]?.notes || '',
        status: toothConditions[toothNumber]?.toothStatus || 'In Progress' // Include tooth status
      }))
      
      const treatmentData = {
        ...formData,
        description: formData.description?.trim() || null,
        notes: formData.notes?.trim() || null,
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        teethStatus,
        appointmentId: formData.appointmentId || null // Explicitly include appointmentId
      }
      
      onSave(treatmentData)
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      patientId: '',
      treatmentName: '',
      description: '',
      treatmentStatus: 'In Progress',
      creationDate: getTodayISO(),
      totalAmount: '',
      paidAmount: '0',
      notes: '',
      appointmentId: ''
    })
    setSelectedTeeth([])
    setToothConditions({})
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  // Main content
  const content = (
    <form id="treatment-form" onSubmit={handleSubmit} className="w-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b shrink-0 ${
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
              {initialData ? 'Update treatment details' : appointmentData ? 'Create treatment from appointment' : 'Create a comprehensive treatment plan'}
            </p>
          </div>
        </div>
        {!asFullPage && (
          <button
            type="button"
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
              <span className="text-red-500 font-bold">*</span>
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
        </div>

        {/* Content Area - Scrollable */}
        <div className={`flex-1 overflow-y-auto p-5 ${
          isDarkMode ? 'bg-gray-600/20' : 'bg-gray-50'
        }`}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Patient Selection */}
              <SectionCard icon={FaUser} title="Patient Information" iconColor="text-teal-500">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Patient <span className="text-red-500">*</span>
                    {(appointmentData || initialData) && (
                      <span className={`ml-2 text-xs font-normal ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        (Cannot be changed)
                      </span>
                    )}
                  </label>
                  <Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    options={[
                      ...patients.map(p => ({ value: p.id, label: p.name }))
                    ]}
                    disabled={!!appointmentData || !!initialData}
                  />
                  {errors.patientId && (
                    <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
                  )}
                  {appointmentData && formData.patientId && (
                    <div className={`mt-2 p-2 rounded-lg text-xs ${
                      isDarkMode ? 'bg-teal-900/20 text-teal-300' : 'bg-teal-50 text-teal-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FaUser className="w-3 h-3" />
                        <span>Patient: {appointmentData.patientName}</span>
                      </div>
                      {appointmentData.patientPhone && (
                        <div className="flex items-center gap-2 mt-1">
                          <span>📞 {appointmentData.patientPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Treatment Details */}
              <SectionCard icon={FaStethoscope} title="Treatment Details" iconColor="text-teal-500">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Treatment Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="treatmentName"
                        value={formData.treatmentName}
                        onChange={handleChange}
                        options={loadingTreatments ? [] : availableTreatments.map(t => ({ 
                          value: t.name, 
                          label: `${t.name} - $${t.cost}` 
                        }))}
                        disabled={loadingTreatments}
                      />
                      {loadingTreatments && (
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Loading treatments...</p>
                      )}
                      {!loadingTreatments && availableTreatments.length === 0 && (
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>No treatments configured for your clinic</p>
                      )}
                      {errors.treatmentName && (
                        <p className="text-red-500 text-sm mt-1">{errors.treatmentName}</p>
                      )}
                    </div>
                  </div>

                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    label="Description"
                    placeholder="Describe the treatment plan and procedures..."
                  />
                </div>
              </SectionCard>

              {/* Payment Information */}
              <SectionCard icon={FaDollarSign} title="Payment Information" iconColor="text-teal-500">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total Amount <span className="text-red-500">*</span>
                    {initialData && (
                      <span className={`ml-2 text-xs font-normal ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        (Cannot be changed after creation)
                      </span>
                    )}
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
                    disabled={!!initialData}
                  />
                  {errors.totalAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>
                  )}
                </div>
              </SectionCard>

              {/* Notes */}
              <SectionCard icon={FaStickyNote} title="Clinical Notes" iconColor="text-yellow-500">
                <TextArea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional clinical notes or observations..."
                />
              </SectionCard>
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
                        toothConditions={patientTeethHistory}
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
                      {selectedTeeth.map(toothNumber => {
                        const isCompleted = toothConditions[toothNumber]?.toothStatus === 'Completed'
                        return (
                        <Card key={toothNumber} className={`border ${
                          isCompleted 
                            ? isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50'
                            : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          <Card.Content className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`font-semibold text-lg flex items-center gap-2 ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                <FaTooth className={isCompleted ? 'text-green-500' : 'text-teal-500'} />
                                Tooth #{toothNumber}
                                {isCompleted && (
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-200 text-green-800'
                                  }`}>
                                    ✓ Completed
                                  </span>
                                )}
                              </h4>
                              {!isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => handleToothSelect(toothNumber)}
                                  className="text-red-500 hover:text-red-600"
                                  title="Delete tooth"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              )}
                              {isCompleted && (
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Completed teeth cannot be edited or deleted">
                                  🔒 Read-only
                                </span>
                              )}
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
                                  disabled={isCompleted}
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                                    isCompleted ? 'cursor-not-allowed opacity-60' : ''
                                  } ${
                                    isDarkMode
                                      ? 'bg-gray-700 border-gray-600 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  {TOOTH_CONDITION_OPTIONS.map(opt => (
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
                                  disabled={isCompleted}
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                                    isCompleted ? 'cursor-not-allowed opacity-60' : ''
                                  } ${
                                    isDarkMode
                                      ? 'bg-gray-700 border-gray-600 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  {PRIORITY_OPTIONS.map(opt => (
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
                                  disabled={isCompleted}
                                  placeholder="Add notes for this tooth..."
                                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                                    isCompleted ? 'cursor-not-allowed opacity-60' : ''
                                  } ${
                                    isDarkMode
                                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                  }`}
                                />
                              </div>
                            </div>
                          </Card.Content>
                        </Card>
                      )})}
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
      </form>
    )

  // Wrap content in modal backdrop if not full page
  if (asFullPage) {
    return content
  }

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
  )
}

export default TreatmentModal
