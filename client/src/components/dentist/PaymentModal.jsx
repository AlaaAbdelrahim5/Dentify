import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FaTimes, FaSave, FaDollarSign, FaCreditCard, FaMoneyBillWave, FaStickyNote, FaUser, FaStethoscope } from 'react-icons/fa'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'

const PaymentModal = ({ isOpen, onClose, onSave, treatmentInfo = null, patients = [], treatments = [] }) => {
  const { isDarkMode } = useTheme()
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedTreatment, setSelectedTreatment] = useState('')
  const [patientTreatments, setPatientTreatments] = useState([])
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      if (treatmentInfo) {
        // If treatment is provided, pre-select it
        setSelectedPatient(treatmentInfo.patientId?.toString() || '')
        setSelectedTreatment(treatmentInfo.id?.toString() || '')
      } else {
        setSelectedPatient('')
        setSelectedTreatment('')
        setPatientTreatments([])
      }
      
      setFormData({
        amount: '',
        paymentMethod: 'Cash',
        notes: ''
      })
      setErrors({})
    }
  }, [isOpen, treatmentInfo])

  // Update patient treatments when patient is selected
  useEffect(() => {
    if (selectedPatient && !treatmentInfo) {
      const filteredTreatments = treatments.filter(
        t => t.patientId.toString() === selectedPatient && t.totalAmount > t.paidAmount
      )
      setPatientTreatments(filteredTreatments)
      setSelectedTreatment('')
    }
  }, [selectedPatient, treatments, treatmentInfo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!treatmentInfo && !selectedPatient) {
      newErrors.patient = 'Please select a patient'
    }

    if (!treatmentInfo && !selectedTreatment) {
      newErrors.treatment = 'Please select a treatment'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    const treatment = treatmentInfo || treatments.find(t => t.id.toString() === selectedTreatment)
    if (treatment) {
      const remainingBalance = treatment.totalAmount - treatment.paidAmount
      if (parseFloat(formData.amount) > remainingBalance) {
        newErrors.amount = `Amount exceeds remaining balance ($${remainingBalance.toFixed(2)})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const treatment = treatmentInfo || treatments.find(t => t.id.toString() === selectedTreatment)
      const patient = patients.find(p => p.id.toString() === (treatmentInfo?.patientId || selectedPatient))
      
      const paymentData = {
        treatmentId: treatment.id,
        amount: parseFloat(formData.amount),
        method: formData.paymentMethod, // Backend expects 'method' not 'paymentMethod'
        notes: formData.notes || undefined
      }
      onSave(paymentData)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedPatient('')
    setSelectedTreatment('')
    setPatientTreatments([])
    setFormData({
      amount: '',
      paymentMethod: 'Cash',
      notes: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const currentTreatment = treatmentInfo || treatments.find(t => t.id.toString() === selectedTreatment)
  const remainingBalance = currentTreatment 
    ? currentTreatment.totalAmount - currentTreatment.paidAmount 
    : 0

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
          className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
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
          <div>
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Record Payment
            </h2>
            {currentTreatment && (
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {currentTreatment.treatmentType} - {currentTreatment.patientName}
              </p>
            )}
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
        {/* Treatment Info */}
        {currentTreatment && (
          <div className={`mx-6 mt-6 p-4 rounded-lg border-2 ${
            isDarkMode ? 'bg-teal-900/20 border-teal-700' : 'bg-teal-50 border-teal-200'
          }`}>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Amount
                </p>
                <p className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  ${currentTreatment.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paid Amount
                </p>
                <p className={`text-lg font-semibold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  ${currentTreatment.paidAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remaining Balance
                </p>
                <p className={`text-lg font-semibold ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  ${remainingBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection - Only show if no treatment is pre-selected */}
          {!treatmentInfo && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Patient <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.patient && (
                  <p className="text-red-500 text-sm mt-1">{errors.patient}</p>
                )}
              </div>

              {/* Treatment Selection - Only show when patient is selected */}
              {selectedPatient && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Treatment <span className="text-red-500">*</span>
                  </label>
                  {patientTreatments.length > 0 ? (
                    <>
                      <div className="relative">
                        <FaStethoscope className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <select
                          value={selectedTreatment}
                          onChange={(e) => setSelectedTreatment(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="">Choose a treatment...</option>
                          {patientTreatments.map(treatment => {
                            const balance = treatment.totalAmount - treatment.paidAmount
                            return (
                              <option key={treatment.id} value={treatment.id}>
                                {treatment.treatmentType} - Balance: ${balance.toFixed(2)}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      {errors.treatment && (
                        <p className="text-red-500 text-sm mt-1">{errors.treatment}</p>
                      )}
                    </>
                  ) : (
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-yellow-700'
                      }`}>
                        No active treatments with outstanding balance for this patient.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0.01"
              icon={FaDollarSign}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
            {currentTreatment && remainingBalance > 0 && (
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Maximum: ${remainingBalance.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: remainingBalance.toFixed(2) }))}
                  className={`text-xs font-medium ${
                    isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'
                  }`}
                >
                  Pay Full Balance
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Cash' }))}
                className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  formData.paymentMethod === 'Cash'
                    ? 'border-teal-600 bg-teal-600/10'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaMoneyBillWave className={`w-5 h-5 ${
                  formData.paymentMethod === 'Cash' ? 'text-teal-600' : ''
                }`} />
                <span className={`font-medium ${
                  formData.paymentMethod === 'Cash'
                    ? 'text-teal-600'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Cash
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Card' }))}
                className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  formData.paymentMethod === 'Card'
                    ? 'border-teal-600 bg-teal-600/10'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaCreditCard className={`w-5 h-5 ${
                  formData.paymentMethod === 'Card' ? 'text-teal-600' : ''
                }`} />
                <span className={`font-medium ${
                  formData.paymentMethod === 'Card'
                    ? 'text-teal-600'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Card
                </span>
              </button>
            </div>
          </div>

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
              rows="3"
              placeholder="Add any additional notes..."
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
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
              className="flex-1"
              disabled={!treatmentInfo && (!selectedPatient || !selectedTreatment)}
            >
              <FaSave className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default PaymentModal
