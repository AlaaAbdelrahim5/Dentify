import { useTheme } from '../contexts/ThemeContext'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

/**
 * ConfirmationModal Component
 * Modern confirmation dialog for activate/deactivate and delete actions
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal handler
 * @param {Function} onConfirm - Confirm action handler
 * @param {Object} item - Item to be affected (clinic, admin, dentist, etc.)
 * @param {string} action - Action type ('activate', 'deactivate', 'delete')
 * @param {string} itemName - Name of the item to display
 * @param {string} itemType - Type of item (e.g., 'Admin', 'Clinic', 'Dentist')
 */
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  item, 
  action,
  itemName,
  itemType = 'Item'
}) => {
  const { isDarkMode } = useTheme()
  
  if (!isOpen || !item) return null

  const isDeactivate = action === 'deactivate'
  const isDelete = action === 'delete'
  const isActivate = action === 'activate'
  const isApprove = action === 'approve'
  const isReject = action === 'reject'
  const isCancel = action === 'cancel'

  const getActionConfig = () => {
    if (isCancel) {
      return {
        title: `Cancel ${itemType}?`,
        message: `Are you sure you want to cancel`,
        description: `This action cannot be undone. The ${itemType.toLowerCase()} will be cancelled.`,
        gradient: 'from-orange-500 to-red-500',
        shadowColor: 'shadow-orange-500/50',
        icon: FaTimesCircle
      }
    } else if (isDelete) {
      return {
        title: `Delete ${itemType}?`,
        message: `Are you sure you want to delete`,
        description: `This action cannot be undone. The ${itemType.toLowerCase()} will be permanently removed.`,
        gradient: 'from-red-500 to-red-600',
        shadowColor: 'shadow-red-500/50',
        icon: FaTimesCircle
      }
    } else if (isDeactivate) {
      return {
        title: `Deactivate ${itemType}?`,
        message: `Are you sure you want to deactivate`,
        description: `The ${itemType.toLowerCase()} will no longer have access to the system.`,
        gradient: 'from-orange-500 to-red-500',
        shadowColor: 'shadow-orange-500/50',
        icon: FaTimesCircle
      }
    } else if (isReject) {
      return {
        title: `Reject ${itemType}?`,
        message: `Are you sure you want to reject`,
        description: `The ${itemType.toLowerCase()} registration will be rejected and removed from the system.`,
        gradient: 'from-red-500 to-red-600',
        shadowColor: 'shadow-red-500/50',
        icon: FaTimesCircle
      }
    } else if (isApprove) {
      return {
        title: `Approve ${itemType}?`,
        message: `Are you sure you want to approve`,
        description: `The ${itemType.toLowerCase()} will be activated and gain access to the system.`,
        gradient: 'from-green-500 to-emerald-500',
        shadowColor: 'shadow-green-500/50',
        icon: FaCheckCircle
      }
    } else {
      return {
        title: `Activate ${itemType}?`,
        message: `Are you sure you want to activate`,
        description: `The ${itemType.toLowerCase()} will regain full access to the system.`,
        gradient: 'from-green-500 to-emerald-500',
        shadowColor: 'shadow-green-500/50',
        icon: FaCheckCircle
      }
    }
  }

  const config = getActionConfig()
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-2xl shadow-2xl w-full max-w-md transform transition-all ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
              : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="flex flex-col items-center pt-8 pb-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${config.gradient} shadow-lg ${config.shadowColor}`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {config.title}
            </h3>

            {/* Message */}
            <p className={`text-center px-6 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {config.message}{' '}
              <span className="font-semibold">{itemName}</span>?
            </p>

            {/* Description */}
            <p className={`text-sm text-center px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {config.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-2">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r ${config.gradient} ${config.shadowColor}`}
            >
              {isCancel ? 'Yes, Cancel' : isDelete ? 'Delete' : isDeactivate ? 'Deactivate' : isReject ? 'Reject' : isApprove ? 'Approve' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
