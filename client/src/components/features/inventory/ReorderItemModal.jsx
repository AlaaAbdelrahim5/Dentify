import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getTodayISO } from '../../../utils/helpers'
import { Card, Button, Input } from '../../common'
import { FaTimes, FaSave, FaShoppingCart } from 'react-icons/fa'

/**
 * ReorderItemModal Component
 * Modal for reordering inventory items
 * Used in clinic inventory management
 */
const ReorderItemModal = ({ isOpen, onClose, onSubmit, item, suppliers = [] }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    quantity: '',
    price: item?.price || '',
    expectedDate: '',
    notes: ''
  })

  if (!isOpen || !item) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      itemId: item.id,
      itemName: item.name,
      supplierId: item.supplierId || suppliers.find(s => s.name === item.supplier)?.id,
      supplierName: item.supplier,
      ...formData,
      totalAmount: parseFloat(formData.quantity) * parseFloat(formData.price)
    })
    // Reset form
    setFormData({
      quantity: '',
      price: item?.price || '',
      expectedDate: '',
      notes: ''
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const price = parseFloat(formData.price) || 0
    return (quantity * price).toFixed(2)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-600 to-red-600 flex items-center justify-center">
                <FaShoppingCart className="text-white text-lg" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Reorder Item
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a reorder request for {item.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <FaTimes className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </Card.Header>
        
        <Card.Content className="p-6">
          {/* Current Item Info */}
          <div className={`mb-6 p-4 rounded-lg border ${
            isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Stock Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Current Quantity:</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Minimum Required:</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.minQuantity} {item.unit}
                </p>
              </div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Last Price:</p>
                <p className={`font-semibold text-green-600`}>
                  ${item.price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Supplier:</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.supplier}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reorder Quantity *
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder={`Quantity in ${item.unit}`}
                  min="1"
                  required
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Recommended: {Math.max(item.minQuantity * 2 - item.quantity, item.minQuantity)} {item.unit}
                </p>
              </div>

              {/* Price per Unit */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price per Unit ($) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Expected Delivery Date */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expected Delivery Date *
                </label>
                <Input
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => handleChange('expectedDate', e.target.value)}
                  min={getTodayISO()}
                  required
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Total Calculation */}
            {formData.quantity && formData.price && (
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode 
                  ? 'border-orange-700 bg-orange-900/20' 
                  : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Order Amount:
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formData.quantity} {item.unit} × ${formData.price}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    ${calculateTotal()}
                  </span>
                </div>
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
                className="flex-1 bg-linear-to-r from-orange-600 to-red-600"
              >
                <FaSave className="mr-2" />
                Create Reorder
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}

export default ReorderItemModal
