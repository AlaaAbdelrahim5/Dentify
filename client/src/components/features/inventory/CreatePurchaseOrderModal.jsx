import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { Card, Button, Input } from '../../common'
import { FaTimes, FaSave, FaShoppingCart, FaPlus, FaTrash } from 'react-icons/fa'

/**
 * CreatePurchaseOrderModal Component
 * Modal for creating new purchase orders
 * Used in clinic inventory management
 */
const CreatePurchaseOrderModal = ({ isOpen, onClose, onSubmit, suppliers = [], items = [] }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDate: '',
    notes: '',
    orderItems: [{ itemId: '', quantity: '', price: '' }]
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate total
    const total = formData.orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.price || 0))
    }, 0)
    
    onSubmit({ ...formData, totalAmount: total })
    
    // Reset form
    setFormData({
      supplierId: '',
      expectedDate: '',
      notes: '',
      orderItems: [{ itemId: '', quantity: '', price: '' }]
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { itemId: '', quantity: '', price: '' }]
    }))
  }

  const removeOrderItem = (index) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }))
  }

  const updateOrderItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const calculateTotal = () => {
    return formData.orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0))
    }, 0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <FaShoppingCart className="text-white text-lg" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Purchase Order
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a new order for inventory items
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => handleChange('supplierId', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expected Delivery Date *
                </label>
                <Input
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => handleChange('expectedDate', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Order Items *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderItem}
                >
                  <FaPlus className="mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.orderItems.map((orderItem, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Item */}
                      <div className="md:col-span-2">
                        <select
                          value={orderItem.itemId}
                          onChange={(e) => updateOrderItem(index, 'itemId', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required
                        >
                          <option value="">Select Item</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <Input
                          type="number"
                          value={orderItem.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          min="1"
                          required
                        />
                      </div>

                      {/* Price per Unit */}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={orderItem.price}
                          onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          required
                        />
                        {formData.orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors`}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                    {orderItem.quantity && orderItem.price && (
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Subtotal: <span className="font-semibold text-green-600">
                          ${(parseFloat(orderItem.quantity) * parseFloat(orderItem.price)).toFixed(2)}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className={`mt-4 p-4 rounded-lg border-2 ${
                isDarkMode 
                  ? 'border-green-700 bg-green-900/20' 
                  : 'border-green-200 bg-green-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about this order"
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

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
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <FaSave className="mr-2" />
                Create Order
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}

export default CreatePurchaseOrderModal
