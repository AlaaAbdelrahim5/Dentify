import { FaXRay, FaCalendarAlt, FaClock, FaStethoscope, FaHospital, FaEye, FaEdit, FaTrash } from 'react-icons/fa'
import { Card, Button } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate } from '../../../utils/helpers'

const RequestCard = ({ 
  request, 
  onViewDetails, 
  onEdit, 
  onDelete,
  onAssignRadiology,
  variant = 'default' // 'default', 'patient', 'radiology', 'dentist'
}) => {
  const { isDarkMode } = useTheme()

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Requested': isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'COMPLETED': isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300',
      'Completed': isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300',
      'AVAILABLE': isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300',
      'CANCELLED': isDarkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-300',
      'Cancelled': isDarkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-300'
    }
    return colors[status] || (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300')
  }

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': <FaClock className="w-3 h-3" />,
      'Requested': <FaClock className="w-3 h-3" />,
      'COMPLETED': <FaEye className="w-3 h-3" />,
      'Completed': <FaEye className="w-3 h-3" />,
      'AVAILABLE': <FaEye className="w-3 h-3" />,
      'CANCELLED': <FaTrash className="w-3 h-3" />,
      'Cancelled': <FaTrash className="w-3 h-3" />
    }
    return icons[status] || null
  }

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pending',
      'Requested': 'Requested',
      'COMPLETED': 'Completed',
      'Completed': 'Completed',
      'AVAILABLE': 'Available',
      'CANCELLED': 'Cancelled',
      'Cancelled': 'Cancelled'
    }
    return labels[status] || status
  }

  const iconColor = variant === 'dentist' ? 'purple' : 'blue'

  return (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkMode ? `bg-${iconColor}-900/30` : `bg-${iconColor}-100`
          }`}>
            <FaXRay className={`text-${iconColor}-600 w-6 h-6`} />
          </div>
          <div>
            <h3 className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {request.imagingType}
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {variant === 'patient' 
                ? `Request #${request.id}` 
                : request.patientName}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${
          getStatusColor(request.status)
        }`}>
          {getStatusIcon(request.status)}
          {getStatusLabel(request.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {variant === 'patient' && (
          <div className="flex items-center gap-2 text-sm">
            <FaStethoscope className="text-gray-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Dr. {request.dentist?.firstName} {request.dentist?.lastName}
            </span>
          </div>
        )}
        {variant === 'radiology' && (
          <div className="flex items-center gap-2 text-sm">
            <FaStethoscope className="text-gray-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {request.dentistName}
            </span>
          </div>
        )}
        {(variant === 'patient' || variant === 'radiology') && request.radiologyCenter && (
          <div className="flex items-center gap-2 text-sm">
            <FaHospital className="text-gray-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {request.radiologyCenter.centerName}
            </span>
          </div>
        )}
        {variant === 'patient' && !request.radiologyCenter && (
          <div className="flex items-center gap-2 text-sm">
            <FaHospital className="text-gray-500 w-4 h-4" />
            <span className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Not assigned yet
            </span>
          </div>
        )}
        {variant === 'dentist' && request.radiologyCenterName && (
          <div className="flex items-center gap-2 text-sm">
            <FaHospital className="text-gray-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {request.radiologyCenterName}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-gray-500 w-4 h-4" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Requested: {variant === 'radiology' 
              ? request.formattedRequestDate 
              : formatDate(request.requestDate)}
          </span>
        </div>
        {request.availableDate && (
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-teal-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-teal-400' : 'text-teal-600'}>
              Available: {variant === 'radiology'
                ? request.formattedAvailableDate
                : formatDate(request.availableDate)}
            </span>
          </div>
        )}
        {variant === 'dentist' && request.treatmentId && request.treatmentName && (
          <div className="flex items-center gap-2 text-sm">
            <FaStethoscope className="text-purple-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-purple-400' : 'text-purple-600'}>
              Treatment: {request.treatmentName}
            </span>
          </div>
        )}
        {request.notes && (
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {request.notes}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(request)}
            title="View Details"
            className="text-blue-600"
          >
            <FaEye className="w-4 h-4" />
          </Button>
        )}
        {onEdit && request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(request)}
            title="Edit Request"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
        )}
        {onDelete && request.status === 'PENDING' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(request.id)}
            title="Delete Request"
            className="text-red-600"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        )}
        {onAssignRadiology && !request.radiologyCenterId && request.status !== 'CANCELLED' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAssignRadiology(request)}
            title="Assign Radiology Center"
            className="text-green-600"
          >
            <FaHospital className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}

export default RequestCard
