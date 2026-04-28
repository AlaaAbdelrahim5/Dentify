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
    notes: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
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
        notes: '',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
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
    let processedValue = value

    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      processedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      // Limit to 19 characters (16 digits + 3 spaces)
      processedValue = processedValue.slice(0, 19)
    }

    // Format expiry date as MM/YY
    if (name === 'expiryDate') {
      processedValue = value.replace(/\D/g, '')
      if (processedValue.length >= 2) {
        processedValue = processedValue.slice(0, 2) + '/' + processedValue.slice(2, 4)
      }
    }

    // Format CVV to only numbers
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
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

    // Validate card information if Card payment method is selected
    if (formData.paymentMethod === 'Card') {
      if (!formData.cardNumber || formData.cardNumber.length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number'
      }
      
      if (!formData.cardHolder || formData.cardHolder.trim().length < 3) {
        newErrors.cardHolder = 'Please enter the cardholder name'
      }
      
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date (MM/YY)'
      } else {
        // Validate expiry date is not in the past
        const [month, year] = formData.expiryDate.split('/')
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
        const now = new Date()
        if (expiry < now) {
          newErrors.expiryDate = 'Card has expired'
        }
      }
      
      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV'
      }
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

      // Include card information if payment method is Card
      if (formData.paymentMethod === 'Card') {
        paymentData.cardInfo = {
          cardNumber: formData.cardNumber,
          cardHolder: formData.cardHolder,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv
        }
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
      notes: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: ''
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
      noPadding
    >
      <div className="flex flex-col max-h-[80vh]">
        {/* Fixed Treatment Info */}
        {currentTreatment && (
          <div className={`flex-shrink-0 mx-6 mt-6 p-4 rounded-lg border-2 ${
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

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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

          {/* Card Information Fields - Only show when Card is selected */}
          {formData.paymentMethod === 'Card' && (
            <div className={`p-4 rounded-lg border-2 space-y-4 ${
              isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`text-sm font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Card Information
              </h4>

              {/* Card Number */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Card Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  icon={FaCreditCard}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                )}
              </div>

              {/* Cardholder Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleChange}
                  placeholder="John Doe"
                  icon={FaUser}
                />
                {errors.cardHolder && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
                )}
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    CVV <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="4"
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className={`flex items-start gap-2 text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <FaCreditCard className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Your card information is securely processed. We do not store your card details on our servers.
                </p>
              </div>
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
              rows="3"
              placeholder="Add any additional notes..."
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
            />
          </div>
          </>
        )}
        </div>

        {/* Fixed Action Buttons */}
        {currentTreatment && (
          <div className={`flex-shrink-0 flex gap-3 px-6 pb-6 pt-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
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
              onClick={handleSubmit}
            >
              <FaSave className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

export default PaymentModal
