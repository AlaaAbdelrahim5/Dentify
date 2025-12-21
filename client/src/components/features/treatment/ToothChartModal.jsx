import { useState, useEffect } from 'react'
import { FaTimes, FaCalendarAlt, FaSave, FaTooth, FaNotesMedical, FaPlus, FaEdit, FaTrash, FaClock } from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import ToothChart from './ToothChart'
import { Button, Input } from '../../common'
import { getTodayISO } from '../../../utils/helpers'

const ToothChartModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null, 
  patientInfo = null,
  treatmentInfo = null,
  onScheduleAppointment = null,
  onCreateTreatment = null
}) => {
  const { isDarkMode } = useTheme()
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [toothConditions, setToothConditions] = useState({})
  const [toothNotes, setToothNotes] = useState({})
  const [toothTreatments, setToothTreatments] = useState({})
  const [currentTooth, setCurrentTooth] = useState(null)
  const [showToothDetails, setShowToothDetails] = useState(false)
  const [formData, setFormData] = useState({
    date: getTodayISO(),
    condition: '',
    severity: 'medium',
    notes: '',
    treatmentPlan: '',
    followUpDate: ''
  })

  useEffect(() => {
    if (initialData) {
      setSelectedTeeth(initialData.selectedTeeth || [])
      setToothConditions(initialData.toothConditions || {})
      setToothNotes(initialData.toothNotes || {})
      setToothTreatments(initialData.toothTreatments || {})
      setFormData({
        date: initialData.date || getTodayISO(),
        condition: initialData.condition || '',
        severity: initialData.severity || 'medium',
        notes: initialData.notes || '',
        treatmentPlan: initialData.treatmentPlan || '',
        followUpDate: initialData.followUpDate || ''
      })
    }
  }, [initialData])

  const handleToothSelect = (toothNumber) => {
    setCurrentTooth(toothNumber)
    setShowToothDetails(true)
    if (selectedTeeth.includes(toothNumber)) {
      // If already selected, just show details
      return
    } else {
      setSelectedTeeth([...selectedTeeth, toothNumber])
    }
  }

  const handleRemoveTooth = (toothNumber) => {
    setSelectedTeeth(selectedTeeth.filter(t => t !== toothNumber))
    const newConditions = { ...toothConditions }
    const newNotes = { ...toothNotes }
    const newTreatments = { ...toothTreatments }
    delete newConditions[toothNumber]
    delete newNotes[toothNumber]
    delete newTreatments[toothNumber]
    setToothConditions(newConditions)
    setToothNotes(newNotes)
    setToothTreatments(newTreatments)
    if (currentTooth === toothNumber) {
      setCurrentTooth(null)
      setShowToothDetails(false)
    }
  }

  const handleConditionChange = (status) => {
    if (currentTooth) {
      setToothConditions({
        ...toothConditions,
        [currentTooth]: {
          status,
          date: formData.date,
          notes: toothNotes[currentTooth] || ''
        }
      })
    }
  }

  const handleToothNoteChange = (note) => {
    if (currentTooth) {
      setToothNotes({
        ...toothNotes,
        [currentTooth]: note
      })
      // Update condition notes too
      if (toothConditions[currentTooth]) {
        setToothConditions({
          ...toothConditions,
          [currentTooth]: {
            ...toothConditions[currentTooth],
            notes: note
          }
        })
      }
    }
  }

  const handleAddTreatmentToTooth = () => {
    if (currentTooth && onCreateTreatment) {
      const toothData = {
        toothNumber: currentTooth,
        condition: toothConditions[currentTooth]?.status || '',
        notes: toothNotes[currentTooth] || '',
        patientInfo
      }
      onCreateTreatment(toothData)
    }
  }

  const handleScheduleAppointmentForTooth = () => {
    if (currentTooth && onScheduleAppointment) {
      const toothData = {
        toothNumber: currentTooth,
        condition: toothConditions[currentTooth]?.status || '',
        notes: toothNotes[currentTooth] || '',
        patientInfo
      }
      onScheduleAppointment(toothData)
    }
  }

  const handleSave = () => {
    const data = {
      selectedTeeth,
      toothConditions,
      toothNotes,
      toothTreatments,
      ...formData
    }
    onSave(data)
    handleClose()
  }

  const handleClose = () => {
    setSelectedTeeth([])
    setToothConditions({})
    setToothNotes({})
    setToothTreatments({})
    setCurrentTooth(null)
    setShowToothDetails(false)
    setFormData({
      date: getTodayISO(),
      condition: '',
      severity: 'medium',
      notes: '',
      treatmentPlan: '',
      followUpDate: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col ${
            isDarkMode
              ? 'bg-gray-800 border-2 border-gray-700'
              : 'bg-white border-2 border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700 bg-linear-to-r from-teal-900/50 to-cyan-900/50' : 'border-gray-200 bg-linear-to-r from-teal-50 to-cyan-50'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDarkMode ? 'bg-teal-900/50 border-2 border-teal-700' : 'bg-teal-100 border-2 border-teal-300'
              }`}>
                <FaTooth className={`w-7 h-7 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Interactive Dental Chart
                </h2>
                {patientInfo && (
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-teal-300' : 'text-teal-600'
                  }`}>
                    Patient: {patientInfo.name}
                  </p>
                )}
                {treatmentInfo && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      isDarkMode ? 'bg-teal-900/50 text-teal-300 border border-teal-700' : 'bg-white text-teal-700 border border-teal-300'
                    }`}>
                      Adding to: {treatmentInfo.treatmentName}
                    </span>
                    {treatmentInfo.toothNumber && (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        isDarkMode ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}>
                        Tooth #{treatmentInfo.toothNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-3 rounded-xl transition-all ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left Panel - Tooth Chart */}
              <div className="lg:col-span-2 space-y-6">
                {/* Date Section */}
                <div className={`p-5 rounded-xl ${
                  isDarkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaCalendarAlt className="text-teal-500" />
                    Examination Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Examination Date
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        icon={FaCalendarAlt}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Follow-up Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={formData.followUpDate}
                        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                        icon={FaClock}
                      />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className={`p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border border-blue-700/50' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    <strong>Instructions:</strong> Click on teeth to select and view/edit details in the right panel.
                  </p>
                </div>

                {/* Tooth Chart */}
                <ToothChart
                  selectedTeeth={selectedTeeth}
                  onToothSelect={handleToothSelect}
                  toothConditions={toothConditions}
                  readOnly={false}
                />

                {/* General Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaNotesMedical className="inline mr-2" />
                    General Examination Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Enter general examination notes..."
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
                    } focus:ring-2 focus:ring-teal-500/20 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Right Panel - Tooth Details */}
              <div className="space-y-4">
                {currentTooth && showToothDetails ? (
                  <div className={`sticky top-0 p-6 rounded-xl border-2 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-teal-600' 
                      : 'bg-white border-teal-400 shadow-lg'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <FaTooth className="text-teal-500" />
                        Tooth #{currentTooth}
                      </h3>
                      <button
                        onClick={() => handleRemoveTooth(currentTooth)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove tooth from selection"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Condition Selection */}
                    <div className="mb-4">
                      <label className={`block text-sm font-semibold mb-3 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Condition Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'healthy', label: 'Healthy', icon: '✓' },
                          { value: 'cavity', label: 'Cavity', icon: '⚠' },
                          { value: 'root-canal', label: 'Root Canal', icon: '⚡' },
                          { value: 'crown', label: 'Crown', icon: '👑' },
                          { value: 'implant', label: 'Implant', icon: '🔧' },
                          { value: 'extracted', label: 'Extracted', icon: '✗' }
                        ].map((condition) => (
                          <button
                            key={condition.value}
                            onClick={() => handleConditionChange(condition.value)}
                            className={`
                              px-3 py-2 rounded-lg font-medium text-sm transition-all
                              ${toothConditions[currentTooth]?.status === condition.value
                                ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-400'
                                : isDarkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            <span className="mr-1">{condition.icon}</span>
                            {condition.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tooth-Specific Notes */}
                    <div className="mb-4">
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Tooth Notes
                      </label>
                      <textarea
                        value={toothNotes[currentTooth] || ''}
                        onChange={(e) => handleToothNoteChange(e.target.value)}
                        rows={4}
                        placeholder={`Specific notes for tooth #${currentTooth}...`}
                        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
                        } focus:ring-2 focus:ring-teal-500/20 focus:outline-none`}
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Quick Actions
                      </label>
                      
                      {onCreateTreatment && (
                        <button
                          onClick={handleAddTreatmentToTooth}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            isDarkMode
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <FaPlus className="w-3 h-3" />
                          Create Treatment Plan
                        </button>
                      )}
                      
                      {onScheduleAppointment && (
                        <button
                          onClick={handleScheduleAppointmentForTooth}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            isDarkMode
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                        >
                          <FaCalendarAlt className="w-3 h-3" />
                          Schedule Appointment
                        </button>
                      )}
                    </div>

                    {/* Tooth Info Summary */}
                    {toothConditions[currentTooth] && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                      }`}>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <div className="flex justify-between mb-1">
                            <span>Status:</span>
                            <span className="font-semibold capitalize">
                              {toothConditions[currentTooth].status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span className="font-semibold">
                              {new Date(formData.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`p-8 rounded-xl text-center ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <FaTooth className={`w-12 h-12 mx-auto mb-3 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Select a tooth from the chart to view and edit details
                    </p>
                  </div>
                )}

                {/* Selected Teeth List */}
                {selectedTeeth.length > 0 && (
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Selected Teeth ({selectedTeeth.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeeth.map(toothNumber => (
                        <button
                          key={toothNumber}
                          onClick={() => {
                            setCurrentTooth(toothNumber)
                            setShowToothDetails(true)
                          }}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                            ${currentTooth === toothNumber
                              ? 'bg-teal-600 text-white ring-2 ring-teal-400'
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                            }
                          `}
                        >
                          #{toothNumber}
                          {toothConditions[toothNumber] && (
                            <span className="ml-1">
                              {toothConditions[toothNumber].status === 'healthy' && '✓'}
                              {toothConditions[toothNumber].status === 'cavity' && '⚠'}
                              {toothConditions[toothNumber].status === 'root-canal' && '⚡'}
                              {toothConditions[toothNumber].status === 'crown' && '👑'}
                              {toothConditions[toothNumber].status === 'implant' && '🔧'}
                              {toothConditions[toothNumber].status === 'extracted' && '✗'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section - Treatment Plan & Severity */}
            <div className="px-6 pb-6 space-y-4">
              {/* Treatment Plan */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Overall Treatment Plan
                </label>
                <textarea
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                  rows={3}
                  placeholder="Enter comprehensive treatment plan..."
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
                  } focus:ring-2 focus:ring-teal-500/20 focus:outline-none`}
                />
              </div>

              {/* Severity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Overall Case Severity
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'low', label: 'Low', color: 'green' },
                    { value: 'medium', label: 'Medium', color: 'yellow' },
                    { value: 'high', label: 'High', color: 'orange' },
                    { value: 'urgent', label: 'Urgent', color: 'red' }
                  ].map((severity) => (
                    <button
                      key={severity.value}
                      onClick={() => setFormData({ ...formData, severity: severity.value })}
                      className={`
                        px-4 py-3 rounded-lg font-medium transition-all
                        ${formData.severity === severity.value
                          ? `bg-${severity.color}-600 text-white shadow-lg`
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {severity.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedTeeth.length > 0 && (
                <div className={`p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-teal-900/20 border border-teal-700/50' 
                    : 'bg-teal-50 border border-teal-200'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-teal-300' : 'text-teal-800'
                  }`}>
                    Chart Summary
                  </h4>
                  <div className={`text-sm space-y-1 ${
                    isDarkMode ? 'text-teal-200' : 'text-teal-700'
                  }`}>
                    <p>• {selectedTeeth.length} {selectedTeeth.length === 1 ? 'tooth' : 'teeth'} selected</p>
                    <p>• {Object.keys(toothConditions).length} {Object.keys(toothConditions).length === 1 ? 'condition' : 'conditions'} recorded</p>
                    <p>• {Object.keys(toothNotes).filter(k => toothNotes[k]).length} {Object.keys(toothNotes).filter(k => toothNotes[k]).length === 1 ? 'note' : 'notes'} added</p>
                    <p>• Severity: <span className="capitalize font-semibold">{formData.severity}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-3 p-6 border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <Button
              variant="outline"
              onClick={handleClose}
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={selectedTeeth.length === 0}
            >
              <FaSave className="w-4 h-4 mr-2" />
              Save Chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToothChartModal
