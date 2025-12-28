import { useState, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { BaseModal, Button, Input } from '../../common'
import { FaTimes, FaBoxes, FaSearch, FaDollarSign, FaWarehouse } from 'react-icons/fa'

/**
 * SupplierItemsModal Component
 * Modal for viewing all items supplied by a specific supplier
 * Used in clinic inventory supplier management
 */
const SupplierItemsModal = ({ isOpen, onClose, supplier, items = [] }) => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter items by this supplier
  const supplierItems = useMemo(() => {
    if (!supplier) return []
    return items.filter(item => 
      item.supplier === supplier.name || item.supplierId === supplier.id
    ).filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, supplier, searchTerm])

  const totalValue = supplierItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const totalItems = supplierItems.length

  if (!supplier) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'adequate':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'low':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      noPadding
    >
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
          <FaBoxes className="text-white text-xl" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Items from {supplier.name}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {totalItems} items • Total Value: ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaBoxes className={`text-blue-600`} />
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Items</p>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalItems}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaDollarSign className={`text-green-600`} />
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
                </div>
                <p className={`text-2xl font-bold text-green-600`}>
                  ${totalValue.toFixed(2)}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaWarehouse className={`text-purple-600`} />
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Stock</p>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {supplierItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)}
                </p>
              </div>
            </div>

            {/* Items Table */}
            {supplierItems.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FaBoxes className="mx-auto text-4xl mb-3 opacity-50" />
                <p>No items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Item Name
                      </th>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Quantity
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Price
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Value
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierItems.map((item) => (
                      <tr 
                        key={item.id}
                        className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      >
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="font-medium">{item.name}</div>
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.category}
                        </td>
                        <td className={`py-3 px-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <span className="font-semibold">{item.quantity}</span> {item.unit}
                        </td>
                        <td className={`py-3 px-4 text-center font-semibold text-green-600`}>
                          ${item.price.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-center`}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={`border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <td colSpan="4" className={`py-3 px-4 text-right font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Total:
                      </td>
                      <td className={`py-3 px-4 text-center font-bold text-green-600 text-lg`}>
                        ${totalValue.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 mt-6`}>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              <FaTimes className="mr-2" />
              Close
            </Button>
          </div>
      </div>
    </BaseModal>
  )
}

export default SupplierItemsModal
