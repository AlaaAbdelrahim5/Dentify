import { useTheme } from '../../../contexts/ThemeContext'
import { Card, Button, StatusBadge } from '../../common'
import { FaTimes, FaTruck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBoxes, FaCalendarAlt, FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

/**
 * ViewSupplierModal Component
 * Modal for viewing detailed supplier information
 * Used in clinic inventory supplier management
 */
const ViewSupplierModal = ({ isOpen, onClose, supplier, onEdit, canEdit = true }) => {
  const { isDarkMode } = useTheme()

  if (!isOpen || !supplier) return null

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        icon: FaCheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        label: 'Active'
      },
      inactive: {
        icon: FaTimesCircle,
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        label: 'Inactive'
      }
    }
    return configs[status] || configs.active
  }

  const statusConfig = getStatusConfig(supplier.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <FaTruck className="text-white text-xl" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Supplier Details
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete supplier information and history
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
            {/* Supplier Name & Status */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {supplier.name}
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Contact: {supplier.contact}
                </p>
              </div>
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className={statusConfig.color} />
                {statusConfig.label}
              </span>
            </div>

            {/* Contact Information */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className={`text-sm font-semibold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact Information
              </h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <FaEnvelope className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {supplier.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <FaPhone className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {supplier.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <FaMapMarkerAlt className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Address</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {supplier.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Statistics */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className={`text-sm font-semibold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Business Statistics
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaBoxes className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Items Supplied</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {supplier.itemsCount || 0}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Order</p>
                  </div>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {supplier.lastOrder ? new Date(supplier.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No orders yet'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaTruck className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivery Rating</p>
                  </div>
                  <p className={`text-2xl font-bold text-yellow-600`}>
                    {supplier.rating ? `${supplier.rating}/5` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            {(supplier.totalOrders || supplier.totalSpent) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {supplier.totalOrders || 0}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</p>
                  <p className={`text-2xl font-bold text-green-600`}>
                    ${supplier.totalSpent?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {supplier.notes && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <h5 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {supplier.notes}
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
                    onEdit && onEdit(supplier)
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <FaEdit className="mr-2" />
                  Edit Supplier
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

export default ViewSupplierModal
