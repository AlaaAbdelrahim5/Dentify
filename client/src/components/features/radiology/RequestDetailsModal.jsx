import { useState } from 'react'
import { FaXRay, FaUser, FaCalendarAlt, FaHospital, FaStickyNote, FaTimes, FaStethoscope } from 'react-icons/fa'
import { Button, Card, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate as formatDateHelper } from '../../../utils/helpers'

const RequestDetailsModal = ({ request, isOpen, onClose, onStatusUpdate }) => {
  const { isDarkMode } = useTheme()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !request) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title={
        <div className="flex items-center gap-2">
          <FaXRay className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
          <span>Request Details</span>
        </div>
      }
      noPadding
    >
      <div className="flex flex-col max-h-[80vh]">
        {/* Fixed Top Section */}
        <div className="flex-shrink-0 p-6 pb-4">
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
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">

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
                <FaStethoscope className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
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
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaCalendarAlt className={isDarkMode ? 'text-orange-400' : 'text-orange-600'} />
                Report File
              </h4>
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

        {/* Fixed Bottom Section */}
        <div className={`flex-shrink-0 flex justify-end gap-3 p-6 pt-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {request.status === 'REQUESTED' && onStatusUpdate && (
            <Button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Mark as In Progress
            </Button>
          )}
          {request.status === 'IN_PROGRESS' && onStatusUpdate && (
            <Button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
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
    </BaseModal>
  )
}

export default RequestDetailsModal
