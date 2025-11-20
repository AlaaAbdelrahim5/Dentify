import { FaTimes, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '../index'
import { useTheme } from '../../contexts/ThemeContext'

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, appointmentData }) => {
  const { isDarkMode } = useTheme()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="w-6 h-6 text-red-500" />
            <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Confirm Delete
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <FaTimes className={`w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Are you sure you want to delete this? This action cannot be undone.
          </p>
          
          {appointmentData && (
            <div className={`p-4 rounded-lg border-l-4 border-red-500 ${
              isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <div className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {appointmentData.patient?.name || 'Patient'}
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {appointmentData.treatment} • {appointmentData.time}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex justify-end gap-3 p-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FaTrash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal