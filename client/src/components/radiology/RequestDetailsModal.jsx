import { useState } from 'react'
import { FaXRay, FaUser, FaCalendarAlt, FaHospital, FaStickyNote, FaTimes } from 'react-icons/fa'
import { Card, Button } from '../index'
import { useTheme } from '../../contexts/ThemeContext'

const RequestDetailsModal = ({ request, isOpen, onClose, onStatusUpdate }) => {
  const { isDarkMode } = useTheme()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !request) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true)
    try {
      await onStatusUpdate(request.id, newStatus)
      onClose()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaXRay className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                Request Details
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Request Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Request ID
                </p>
                <p className={`font-semibold mt-1 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#{request.id}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Imaging Type
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{request.imagingType}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Request Date
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(request.requestDate)}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{request.status}</p>
              </div>
            </div>

            {/* Patient Info */}
            <Card className="p-4">
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaUser className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                Patient Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Name
                  </p>
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {request.patient?.firstName} {request.patient?.lastName}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gender
                  </p>
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{request.patient?.gender || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Dentist Info */}
            <Card className="p-4">
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaHospital className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                Requesting Dentist
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Name
                  </p>
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dr. {request.dentist?.firstName} {request.dentist?.lastName}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Specialization
                  </p>
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{request.dentist?.specialization || 'General'}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {request.notes && (
              <Card className="p-4">
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <FaStickyNote className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                  Notes
                </h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {request.notes}
                </p>
              </Card>
            )}

            {/* Report File */}
            {request.reportFile && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Report File</h4>
                <a
                  href={request.reportFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Report
                </a>
              </Card>
            )}

            {/* Available Date */}
            {request.availableDate && (
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Result Available Date
                </p>
                <p className="font-semibold mt-1">{formatDate(request.availableDate)}</p>
              </div>
            )}
          </div>

          {/* Footer - Status Actions */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-end gap-3">
              {request.status === 'REQUESTED' && (
                <Button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mark as In Progress
                </Button>
              )}
              {request.status === 'IN_PROGRESS' && (
                <Button
                  onClick={() => handleStatusChange('COMPLETED')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark as Completed
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetailsModal
