import { FaXRay, FaCalendarAlt, FaClock, FaStethoscope, FaHospital, FaEye, FaEdit, FaTrash, FaDownload, FaLink, FaFileUpload, FaCheck, FaBan, FaCheckCircle } from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Card, Button } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate } from '../../../utils/helpers'

const RequestCard = ({ 
  request, 
  onViewDetails, 
  onViewImages,
  onDownload,
  onEdit, 
  onDelete,
  onAssignRadiology,
  variant = 'default' // 'default', 'patient', 'radiology', 'dentist'
}) => {
  const { isDarkMode } = useTheme()

  // Check if reportFile is a URL (not base64)
  const isReportFileUrl = (reportFile) => {
    if (!reportFile) return false
    try {
      const parsed = JSON.parse(reportFile)
      if (Array.isArray(parsed)) return false
    } catch (e) {}
    return reportFile.startsWith('http://') || reportFile.startsWith('https://')
  }

  const getStatusColor = (status) => {
    const colors = {
      'REQUESTED': isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' : 'bg-yellow-100 text-yellow-700 border-yellow-400',
      'PENDING': isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' : 'bg-yellow-100 text-yellow-700 border-yellow-400',
      'Requested': isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' : 'bg-yellow-100 text-yellow-700 border-yellow-400',
      'COMPLETED': isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-400',
      'Completed': isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-400',
      'AVAILABLE': isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-400',
      'CANCELLED': isDarkMode ? 'bg-red-900/30 text-red-400 border-red-600' : 'bg-red-100 text-red-700 border-red-400',
      'Cancelled': isDarkMode ? 'bg-red-900/30 text-red-400 border-red-600' : 'bg-red-100 text-red-700 border-red-400'
    }
    return colors[status] || (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300')
  }

  const getStatusIcon = (status) => {
    const icons = {
      'REQUESTED': <MdPendingActions className="w-3 h-3" />,
      'PENDING': <MdPendingActions className="w-3 h-3" />,
      'Requested': <MdPendingActions className="w-3 h-3" />,
      'COMPLETED': <FaCheckCircle className="w-3 h-3" />,
      'Completed': <FaCheckCircle className="w-3 h-3" />,
      'AVAILABLE': <FaCheckCircle className="w-3 h-3" />,
      'CANCELLED': <FaBan className="w-3 h-3" />,
      'Cancelled': <FaBan className="w-3 h-3" />
    }
    return icons[status] || null
  }

  const getStatusLabel = (status) => {
    const labels = {
      'REQUESTED': 'Requested',
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
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
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
        {/* RADIOLOGY CENTER VIEW */}
        {variant === 'radiology' && (
          <>
            {/* View Images or View Details */}
            {!isReportFileUrl(request.reportFile) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => request.reportFile ? onViewImages(request) : onViewDetails(request)}
                title={request.reportFile ? "View Images" : "View Details"}
                className={request.reportFile ? "text-teal-600" : "text-blue-600"}
              >
                <FaEye className="w-4 h-4" />
              </Button>
            )}
            
            {/* Upload Result button */}
            {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(request)}
                title="Upload Result"
                className="text-green-600"
              >
                <FaFileUpload className="w-4 h-4" />
              </Button>
            )}
            
            {/* Update Result button */}
            {request.status === 'COMPLETED' && onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(request)}
                title="Update Result"
                className="text-orange-600"
              >
                <FaEdit className="w-4 h-4" />
              </Button>
            )}
            
            {/* Download Report button */}
            {request.reportFile && request.status === 'COMPLETED' && onDownload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(request)}
                title={isReportFileUrl(request.reportFile) ? "View Report" : "Download Report"}
                className="text-purple-600"
              >
                {isReportFileUrl(request.reportFile) ? (
                  <FaLink className="w-4 h-4" />
                ) : (
                  <FaDownload className="w-4 h-4" />
                )}
              </Button>
            )}
          </>
        )}

        {/* PATIENT VIEW */}
        {variant === 'patient' && (
          <>
            {/* View Images button */}
            {request.reportFile && !isReportFileUrl(request.reportFile) && onViewImages && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewImages(request)}
                title="View Images"
                className="text-teal-600"
              >
                <FaEye className="w-4 h-4" />
              </Button>
            )}
            
            {/* Download/View Report button */}
            {request.reportFile && onDownload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(request)}
                title={isReportFileUrl(request.reportFile) ? "View Report" : "Download Report"}
                className="text-purple-600"
              >
                {isReportFileUrl(request.reportFile) ? (
                  <FaLink className="w-4 h-4" />
                ) : (
                  <FaDownload className="w-4 h-4" />
                )}
              </Button>
            )}
            
            {/* No images available - disabled button */}
            {!request.reportFile && request.status === 'COMPLETED' && (
              <Button 
                variant="outline" 
                size="sm"
                disabled
                title="No images available"
                className="text-gray-400"
              >
                <FaEye className="w-4 h-4" />
              </Button>
            )}
          </>
        )}

        {/* DENTIST VIEW */}
        {variant === 'dentist' && (
          <>
            {/* View Images button */}
            {request.reportFile && !isReportFileUrl(request.reportFile) && onViewImages && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewImages(request)}
                title="View Images"
                className="text-teal-600"
              >
                <FaEye className="w-4 h-4" />
              </Button>
            )}
            
            {/* Download/View Report button */}
            {request.reportFile && onDownload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(request)}
                title={isReportFileUrl(request.reportFile) ? "View Report" : "Download Report"}
                className="text-purple-600"
              >
                {isReportFileUrl(request.reportFile) ? (
                  <FaLink className="w-4 h-4" />
                ) : (
                  <FaDownload className="w-4 h-4" />
                )}
              </Button>
            )}
            
            {/* No images available - disabled button */}
            {!request.reportFile && request.status !== 'Requested' && (
              <Button 
                variant="outline" 
                size="sm"
                disabled
                title="No images available"
                className="text-gray-400"
              >
                <FaEye className="w-4 h-4" />
              </Button>
            )}
            
            {/* Cancel/Delete button for Requested status */}
            {request.status === 'Requested' && onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(request)}
                title="Cancel Request"
                className="text-red-600"
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

export default RequestCard
