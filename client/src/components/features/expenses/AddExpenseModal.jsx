import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getTodayISO } from '../../../utils/helpers'
import { Card, Button, Input, Select, BaseModal } from '../../common'
import { FaSave, FaMoneyBillWave, FaTimes } from 'react-icons/fa'

/**
 * AddExpenseModal Component
 * Modal for adding general clinic expenses
 */
const AddExpenseModal = ({ isOpen, onClose, onSubmit }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: '',
    paymentMethod: '',
    status: 'paid',
    receiptNumber: ''
  })

  const categories = [
    'Utilities',
    'Rent',
    'Maintenance',
    'Salaries',
    'Marketing',
    'Equipment',
    'Insurance',
    'Supplies',
    'Professional Fees',
    'Training',
    'Transportation',
    'Other'
  ]

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Check',
    'Credit Card',
    'Debit Card'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    
    // Reset form
    setFormData({
      category: '',
      description: '',
      amount: '',
      date: '',
      paymentMethod: '',
      status: 'paid',
      receiptNumber: ''
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-600 to-pink-600 flex items-center justify-center">
          <FaMoneyBillWave className="text-white text-lg" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add Expense
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Record a new clinic expense
          </p>
        </div>
      </div>
      
      <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category *"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                placeholder="Select Category"
                required
              />

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount ($) *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="e.g., Electricity Bill - November"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  max={getTodayISO()}
                  required
                />
              </div>

              <Select
                label="Payment Method *"
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                options={paymentMethods.map(method => ({ value: method, label: method }))}
                placeholder="Select Payment Method"
                required
              />

              {/* Receipt Number */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Receipt Number (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.receiptNumber}
                  onChange={(e) => handleChange('receiptNumber', e.target.value)}
                  placeholder="REC-2024-001"
                />
              </div>

              <Select
                label="Status *"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' }
                ]}
                required
              />
            </div>

            {/* Amount Preview */}
            {formData.amount && (
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode 
                  ? 'border-red-700 bg-red-900/20' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expense Amount:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    ${parseFloat(formData.amount).toFixed(2)}
                  </span>
                </div>
                {formData.category && (
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Category: {formData.category}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                <FaTimes className="mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-linear-to-r from-red-600 to-pink-600"
              >
                <FaSave className="mr-2" />
                Save Expense
              </Button>
            </div>
          </form>
      </div>
    </BaseModal>
  )
}

export default AddExpenseModal
