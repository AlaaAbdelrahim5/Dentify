import { useTheme } from '../../../contexts/ThemeContext'
import { Card, Button, StatusBadge } from '../../common'
import { FaTimes, FaBoxes, FaTruck, FaCalendarAlt, FaDollarSign, FaExclamationTriangle, FaEdit } from 'react-icons/fa'

/**
 * ViewItemModal Component
 * Modal for viewing detailed information about inventory items
 * Used in both clinic and dentist inventory views
 */
const ViewItemModal = ({ isOpen, onClose, item, onEdit, canEdit = false }) => {
  const { isDarkMode } = useTheme()

  if (!isOpen || !item) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'adequate':
        return 'text-green-600'
      case 'low':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      adequate: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Adequate Stock' },
      low: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Low Stock' },
      critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Critical - Reorder Now' }
    }
    const config = statusConfig[status] || statusConfig.adequate
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const calculateDaysUntilExpiry = () => {
    if (!item.expiryDate) return null
    const today = new Date()
    const expiry = new Date(item.expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = calculateDaysUntilExpiry()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <FaBoxes className="text-white text-xl" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Item Details
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete information about this inventory item
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
          <div className="space-y-6">
            {/* Item Name & Status */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Category: {item.category}
                </p>
              </div>
              {getStatusBadge(item.status)}
            </div>

            {/* Stock Information */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className={`text-sm font-semibold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Stock Information
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Quantity</p>
                  <p className={`text-2xl font-bold mt-1 ${getStatusColor(item.status)}`}>
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Minimum Quantity</p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.minQuantity} {item.unit}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock Percentage</p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round((item.quantity / item.minQuantity) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className={`text-sm font-semibold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Financial Information
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price per Unit</p>
                  <p className={`text-xl font-bold mt-1 text-green-600`}>
                    ${item.price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
                  <p className={`text-xl font-bold mt-1 text-green-600`}>
                    ${(item.quantity * item.price)?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reorder Cost</p>
                  <p className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${(item.minQuantity * item.price)?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Supplier & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h5 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Supplier
                  </h5>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.supplier || 'N/A'}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h5 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Restocked
                  </h5>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Expiry Warning */}
            {item.expiryDate && (
              <div className={`p-4 rounded-lg border-2 ${
                daysUntilExpiry < 30
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : daysUntilExpiry < 90
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-green-500 bg-green-50 dark:bg-green-900/20'
              }`}>
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className={`text-xl mt-1 ${
                    daysUntilExpiry < 30 ? 'text-red-600' : daysUntilExpiry < 90 ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <div>
                    <p className={`font-semibold ${
                      daysUntilExpiry < 30 ? 'text-red-700 dark:text-red-400' : 
                      daysUntilExpiry < 90 ? 'text-yellow-700 dark:text-yellow-400' : 
                      'text-green-700 dark:text-green-400'
                    }`}>
                      Expiry Date: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                    <p className={`text-sm mt-1 ${
                      daysUntilExpiry < 30 ? 'text-red-600 dark:text-red-500' : 
                      daysUntilExpiry < 90 ? 'text-yellow-600 dark:text-yellow-500' : 
                      'text-green-600 dark:text-green-500'
                    }`}>
                      {daysUntilExpiry > 0 
                        ? `${daysUntilExpiry} days remaining`
                        : daysUntilExpiry === 0
                        ? 'Expires today!'
                        : 'Expired!'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <h5 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {canEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose()
                    onEdit && onEdit(item)
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  <FaEdit className="mr-2" />
                  Edit Item
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className={canEdit ? 'flex-1' : 'w-full'}
              >
                <FaTimes className="mr-2" />
                Close
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default ViewItemModal
