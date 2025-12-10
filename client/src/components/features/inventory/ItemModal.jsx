import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { Card, Button, Input, BaseModal } from '../../common'
import { FaSave, FaBoxes, FaEdit } from 'react-icons/fa'

/**
 * ItemModal Component
 * Unified modal for adding and editing inventory items
 * Used in clinic inventory management
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal handler
 * @param {Function} onSubmit - Submit handler
 * @param {Object} item - Item to edit (null for adding new item)
 * @param {Array} suppliers - List of available suppliers
 */
const ItemModal = ({ isOpen, onClose, onSubmit, item = null, suppliers = [] }) => {
  const { isDarkMode } = useTheme()
  const isEditMode = !!item
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'units',
    minQuantity: '',
    price: '',
    supplierId: '',
    expiryDate: '',
    notes: ''
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        quantity: item.quantity || '',
        unit: item.unit || 'units',
        minQuantity: item.minQuantity || '',
        price: item.price || '',
        supplierId: item.supplierId || '',
        expiryDate: item.expiryDate || '',
        notes: item.notes || ''
      })
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: '',
        unit: 'units',
        minQuantity: '',
        price: '',
        supplierId: '',
        expiryDate: '',
        notes: ''
      })
    }
  }, [item, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isEditMode) {
      onSubmit({ ...item, ...formData })
    } else {
      onSubmit(formData)
      // Reset form for new items
      setFormData({
        name: '',
        category: '',
        quantity: '',
        unit: 'units',
        minQuantity: '',
        price: '',
        supplierId: '',
        expiryDate: '',
        notes: ''
      })
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const Icon = isEditMode ? FaEdit : FaBoxes
  const gradientColor = isEditMode ? 'from-blue-600 to-cyan-600' : 'from-teal-600 to-cyan-600'
  const title = isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'
  const subtitle = isEditMode ? 'Update item details and quantity' : 'Add a new item to your clinic inventory'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
          <Icon className="text-white text-lg" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Name */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Item Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Dental Composite Resin"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Filling Materials">Filling Materials</option>
                  <option value="Anesthetics">Anesthetics</option>
                  <option value="PPE">PPE (Personal Protective Equipment)</option>
                  <option value="Impression Materials">Impression Materials</option>
                  <option value="Cements">Cements</option>
                  <option value="Instruments">Instruments</option>
                  <option value="Cleaning Supplies">Cleaning Supplies</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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

              {/* Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isEditMode ? 'Current Quantity *' : 'Initial Quantity *'}
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="units">Units</option>
                  <option value="boxes">Boxes</option>
                  <option value="bottles">Bottles</option>
                  <option value="packs">Packs</option>
                  <option value="pieces">Pieces</option>
                  <option value="ml">ML</option>
                  <option value="grams">Grams</option>
                </select>
              </div>

              {/* Minimum Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Minimum Quantity *
                </label>
                <Input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => handleChange('minQuantity', e.target.value)}
                  placeholder="Alert threshold"
                  min="0"
                  required
                />
              </div>

              {/* Price */}
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

              {/* Expiry Date */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expiry Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange('expiryDate', e.target.value)}
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
                  placeholder="Additional notes or specifications"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              >
                <FaSave className="mr-2" />
                {isEditMode ? 'Update Item' : 'Add Item'}
              </Button>
          </div>
        </form>
      </div>
    </BaseModal>
  )
}

export default ItemModal
