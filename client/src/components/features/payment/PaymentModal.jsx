import { useState, useEffect } from 'react'
import { calculateRemainingBalance } from '../../../utils/helpers'
import { useTheme } from '../../../contexts/ThemeContext'
import { FaSave, FaDollarSign, FaCreditCard, FaMoneyBillWave, FaStickyNote, FaUser, FaStethoscope } from 'react-icons/fa'
import { Button, Input, Select, BaseModal } from '../../common'

const PaymentModal = ({ isOpen, onClose, onSave, treatmentInfo = null, patients = [], treatments = [] }) => {
  const { isDarkMode } = useTheme()
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedTreatment, setSelectedTreatment] = useState('')
  const [patientTreatments, setPatientTreatments] = useState([])
  const [formData, setFormData] = useState({
    amount: '',
    discount: '',
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
        discount: '',
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

    if (formData.discount && parseFloat(formData.discount) < 0) {
      newErrors.discount = 'Discount cannot be negative'
    }

    const treatment = treatmentInfo || treatments.find(t => t.id.toString() === selectedTreatment)
    if (treatment) {
      const discount = formData.discount ? parseFloat(formData.discount) : 0
      const amount = formData.amount ? parseFloat(formData.amount) : 0
      const remainingBalance = calculateRemainingBalance(treatment.totalAmount, treatment.paidAmount, treatment.treatmentDiscount)
      
      // Check if payment amount exceeds remaining balance
      if (amount > remainingBalance) {
        newErrors.amount = `Payment amount exceeds remaining balance ($${remainingBalance.toFixed(2)})`
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
        discount: formData.discount ? parseFloat(formData.discount) : 0,
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
      discount: '',
      paymentMethod: 'Cash',
      notes: ''
    })
    setErrors({})
    onClose()
  }

  const currentTreatment = treatmentInfo || treatments.find(t => t.id.toString() === selectedTreatment)
  const remainingBalance = currentTreatment 
    ? currentTreatment.totalAmount - (currentTreatment.treatmentDiscount || 0) - currentTreatment.paidAmount 
    : 0

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment"
      size="3xl"
    >
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
            {(currentTreatment.treatmentDiscount || 0) > 0 && (
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Discount
                </p>
                <p className={`text-lg font-semibold ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  ${(currentTreatment.treatmentDiscount || 0).toFixed(2)}
                </p>
              </div>
            )}
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
                <Select
                  label="Select Patient *"
                  name="selectedPatient"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  error={errors.patient}
                  options={patients.map(patient => ({ value: patient.id, label: patient.name }))}
                  placeholder="Choose a patient..."
                  icon={FaUser}
                />
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
                      <Select
                        name="selectedTreatment"
                        value={selectedTreatment}
                        onChange={(e) => setSelectedTreatment(e.target.value)}
                        error={errors.treatment}
                        options={patientTreatments.map(treatment => {
                          const balance = treatment.totalAmount - treatment.paidAmount
                          return {
                            value: treatment.id,
                            label: `${treatment.treatmentName} - Balance: $${balance.toFixed(2)}`
                          }
                        })}
                        placeholder="Choose a treatment..."
                        icon={FaStethoscope}
                      />
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
          
          {/* Payment fields - Only show when treatment is selected */}
          {currentTreatment && (
          <>
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
              step="any"
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

          {/* Discount */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Discount (Optional)
            </label>
            <Input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="Enter discount amount"
              step="any"
              min="0"
              icon={FaDollarSign}
            />
            {errors.discount && (
              <p className="text-red-500 text-sm mt-1">{errors.discount}</p>
            )}
            {formData.discount && parseFloat(formData.discount) > 0 && (
              <p className={`text-xs mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This discount will reduce the total treatment amount
              </p>
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
              disabled={!currentTreatment}
            >
              <FaSave className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
          </>
        )}
      </form>
    </BaseModal>
  )
}

export default PaymentModal
