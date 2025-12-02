import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { Card, Button, Input } from '../../common'
import { FaTimes, FaSave, FaFileInvoiceDollar, FaPlus, FaTrash } from 'react-icons/fa'

/**
 * AddInvoiceModal Component
 * Modal for adding purchase invoices when orders are received
 * Records actual prices from supplier invoices
 */
const AddInvoiceModal = ({ isOpen, onClose, onSubmit, suppliers = [], orders = [] }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    orderNumber: '',
    invoiceDate: '',
    dueDate: '',
    paidAmount: '',
    status: 'pending',
    notes: '',
    items: [{ name: '', quantity: '', price: '' }]
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const totalAmount = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0))
    }, 0)
    
    onSubmit({
      ...formData,
      totalAmount,
      supplier: suppliers.find(s => s.id === parseInt(formData.supplierId))?.name || ''
    })
    
    // Reset form
    setFormData({
      invoiceNumber: '',
      supplierId: '',
      orderNumber: '',
      invoiceDate: '',
      dueDate: '',
      paidAmount: '',
      status: 'pending',
      notes: '',
      items: [{ name: '', quantity: '', price: '' }]
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: '', price: '' }]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0))
    }, 0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <FaFileInvoiceDollar className="text-white text-lg" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add Purchase Invoice
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Record invoice when order is received with actual prices
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
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Invoice Number *
                </label>
                <Input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                  placeholder="INV-2024-001"
                  required
                />
              </div>

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

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Related Order (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleChange('orderNumber', e.target.value)}
                  placeholder="PO-2024-001"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Invoice Date *
                </label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleChange('invoiceDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date *
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  min={formData.invoiceDate}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Paid Amount
                </label>
                <Input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => handleChange('paidAmount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Invoice Items *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <FaPlus className="mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-5">
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="Quantity"
                          min="1"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          className="w-full"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                    {item.quantity && item.price && (
                      <div className={`text-right mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total: ${(parseFloat(item.quantity) * parseFloat(item.price)).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount Display */}
            {calculateTotal() > 0 && (
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode 
                  ? 'border-blue-700 bg-blue-900/20' 
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Invoice Amount:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                {formData.paidAmount && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Remaining Balance:
                    </span>
                    <span className={`text-lg font-semibold ${
                      calculateTotal() - parseFloat(formData.paidAmount) === 0 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      ${(calculateTotal() - parseFloat(formData.paidAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about this invoice"
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                <FaSave className="mr-2" />
                Save Invoice
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}

export default AddInvoiceModal
