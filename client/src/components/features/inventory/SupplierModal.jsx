import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { Card, Button, Input, PhoneInput, BaseModal } from '../../common'
import { FaSave, FaTruck } from 'react-icons/fa'

/**
 * SupplierModal Component
 * Unified modal for adding and editing suppliers
 * Used in clinic inventory supplier management
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal handler
 * @param {Function} onSubmit - Submit handler
 * @param {Object} supplier - Supplier to edit (null for adding new supplier)
 */
const SupplierModal = ({ isOpen, onClose, onSubmit, supplier = null }) => {
  const { isDarkMode } = useTheme()
  const isEditMode = !!supplier
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contact: supplier.contact || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || ''
      })
    } else {
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      })
    }
  }, [supplier, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isEditMode) {
      onSubmit({
        id: supplier.id,
        ...formData
      })
    } else {
      onSubmit(formData)
      // Reset form for new suppliers
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      })
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const title = isEditMode ? 'Edit Supplier' : 'Add New Supplier'
  const subtitle = isEditMode ? 'Update supplier information' : 'Add a new supplier to your network'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <FaTruck className="text-white text-lg" />
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
              {/* Supplier Name */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Dental Supply Co."
                  required
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Person *
                </label>
                <Input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="supplier@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number *
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => handleChange('phone', value)}
                  required
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full address with city and postal code"
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
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
                  placeholder="Additional notes, payment terms, or special instructions"
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
                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <FaSave className="mr-2" />
                {isEditMode ? 'Update Supplier' : 'Add Supplier'}
              </Button>
            </div>
          </form>
      </div>
    </BaseModal>
  )
}

export default SupplierModal
