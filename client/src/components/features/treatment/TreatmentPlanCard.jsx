import { useTheme } from '../../../contexts/ThemeContext'
import { 
  FaTooth, FaCalendarAlt, FaDollarSign, FaClipboardList, 
  FaCheck, FaClock, FaTimes, FaCheckCircle, FaCalendarPlus,
  FaEye, FaEdit, FaTrash, FaMoneyBillWave, FaXRay, FaPrescriptionBottle
} from 'react-icons/fa'
import { Card, Button } from '../../common'
import { getStatusDisplay as getStatusHelper, calculateRemainingBalance } from '../../../utils/helpers'
import TreatmentTeethStatus from './TreatmentTeethStatus'

const TreatmentPlanCard = ({ 
  treatment, 
  onClick, 
  onBookAppointment,
  onEdit,
  onDelete,
  onAddPayment,
  onRequestRadiology,
  onCreatePrescription,
  onMarkComplete,
  showActions = false
}) => {
  const { isDarkMode } = useTheme()

  // Calculate payments correctly accounting for discount
  const treatmentDiscount = treatment.treatmentDiscount || 0
  const effectiveTotal = treatment.totalAmount - treatmentDiscount
  const remainingBalance = calculateRemainingBalance(treatment.totalAmount, treatment.paidAmount, treatmentDiscount)
  const paymentProgress = effectiveTotal > 0 ? (treatment.paidAmount / effectiveTotal) * 100 : 0

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'In Progress':
        return {
          icon: FaClock,
          label: 'In Progress',
          className: isDarkMode 
            ? 'bg-green-900/30 text-green-400 border-green-600' 
            : 'bg-green-100 text-green-700 border-green-400'
        }
      case 'Completed':
        return {
          icon: FaCheckCircle,
          label: 'Completed',
          className: isDarkMode 
            ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
            : 'bg-blue-100 text-blue-700 border-blue-400'
        }
      case 'Cancelled':
        return {
          icon: FaTimes,
          label: 'Cancelled',
          className: isDarkMode 
            ? 'bg-red-900/30 text-red-400 border-red-600' 
            : 'bg-red-100 text-red-700 border-red-400'
        }
      default:
        return {
          icon: FaClock,
          label: status,
          className: isDarkMode 
            ? 'bg-gray-800 text-gray-300 border-gray-600' 
            : 'bg-white text-gray-700 border-gray-300'
        }
    }
  }

  const statusDisplay = getStatusDisplay(treatment.treatmentStatus)
  const StatusIcon = statusDisplay.icon

  return (
    <Card 
      hover 
      onClick={onClick}
      className="group"
    >
      <Card.Header className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}
              group-hover:scale-110 transition-transform duration-300
            `}>
              <FaTooth className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {treatment.treatmentName}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {treatment.dentistName || treatment.patientName}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
            <StatusIcon className="w-3 h-3" />
            {statusDisplay.label}
          </span>
        </div>
      </Card.Header>

      <Card.Content className="space-y-4">
        {/* Description */}
        {treatment.description && (
          <p className={`text-sm line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {treatment.description}
          </p>
        )}

        {/* Teeth Status Preview */}
        {treatment.teethStatus && treatment.teethStatus.length > 0 && (
          <div>
            <TreatmentTeethStatus teethStatus={treatment.teethStatus} compact={true} />
          </div>
        )}

        {/* Financial Info */}
        <div className={`
          p-3 rounded-lg 
          ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Payment Progress
            </span>
            <span className={`text-sm font-bold ${
              paymentProgress === 100 ? 'text-green-600' : 'text-teal-600'
            }`}>
              {paymentProgress.toFixed(0)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-full ${
                paymentProgress === 100 ? 'bg-green-600' : 'bg-teal-600'
              } transition-all duration-500`}
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Paid: ${treatment.paidAmount.toFixed(2)}
            </span>
            <span className={`text-xs font-medium ${
              remainingBalance > 0 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {remainingBalance > 0 
                ? `Balance: $${remainingBalance.toFixed(2)}` 
                : 'Fully Paid'
              }
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className={`w-4 h-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Started: {new Date(treatment.creationDate).toLocaleDateString()}
          </span>
        </div>

        {/* Book Appointment Button - Only show if not Completed or Cancelled */}
        {onBookAppointment && 
         treatment.treatmentStatus !== 'Completed' && 
         treatment.treatmentStatus !== 'Cancelled' && (
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation() // Prevent card click
              onBookAppointment(treatment)
            }}
            className="w-full mt-2 flex items-center justify-center gap-2"
          >
            <FaCalendarPlus className="w-4 h-4" />
            Book Appointment
          </Button>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {onClick && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick(treatment)
                }}
                title="View Details"
              >
                <FaEye className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(treatment)
                }}
                title="Edit Treatment"
              >
                <FaEdit className="w-4 h-4" />
              </Button>
            )}
            {onAddPayment && remainingBalance > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddPayment(treatment)
                }}
                title="Add Payment"
                className="text-green-600"
              >
                <FaMoneyBillWave className="w-4 h-4" />
              </Button>
            )}
            {onRequestRadiology && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRequestRadiology(treatment)
                }}
                title="Request Radiology"
                className="text-purple-600"
              >
                <FaXRay className="w-4 h-4" />
              </Button>
            )}
            {onCreatePrescription && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCreatePrescription(treatment)
                }}
                title="Create Prescription"
                className="text-blue-600"
              >
                <FaPrescriptionBottle className="w-4 h-4" />
              </Button>
            )}
            {onMarkComplete && treatment.treatmentStatus === 'In Progress' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkComplete(treatment.id, 'Completed')
                }}
                title="Mark Complete"
                className="text-green-600"
              >
                <FaCheck className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(treatment)
                }}
                title="Delete Treatment"
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default TreatmentPlanCard
