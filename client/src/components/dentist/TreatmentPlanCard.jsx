import { useTheme } from '../../contexts/ThemeContext'
import { 
  FaTooth, FaCalendarAlt, FaDollarSign, FaClipboardList, 
  FaCheck, FaClock, FaExclamationTriangle 
} from 'react-icons/fa'
import { Card } from '../index'
import StatusBadge from '../StatusBadge'

const TreatmentPlanCard = ({ treatment, onClick }) => {
  const { isDarkMode } = useTheme()

  const remainingBalance = treatment.totalAmount - treatment.paidAmount
  const paymentProgress = (treatment.paidAmount / treatment.totalAmount) * 100
  const completedSteps = treatment.steps?.filter(s => s.status === 'completed').length || 0
  const totalSteps = treatment.steps?.length || 0

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-500'
      case 'Medium':
        return 'text-yellow-500'
      case 'Low':
        return 'text-green-500'
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600'
    }
  }

  const getProgressColor = () => {
    if (completedSteps === totalSteps) return 'bg-green-600'
    if (completedSteps > 0) return 'bg-teal-600'
    return isDarkMode ? 'bg-gray-600' : 'bg-gray-400'
  }

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
                {treatment.treatmentType}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {treatment.patientName}
              </p>
            </div>
          </div>
          <StatusBadge status={treatment.treatmentStatus} />
        </div>
      </Card.Header>

      <Card.Content className="space-y-4">
        {/* Description */}
        <p className={`text-sm line-clamp-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {treatment.description}
        </p>

        {/* Treatment Progress */}
        {totalSteps > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Treatment Progress
              </span>
              <span className={`text-xs font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {completedSteps}/{totalSteps} Steps
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full ${getProgressColor()} transition-all duration-500`}
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Teeth Affected */}
        {treatment.teethStatus && treatment.teethStatus.length > 0 && (
          <div className="flex items-center gap-2">
            <FaTooth className={`w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <div className="flex flex-wrap gap-2">
              {treatment.teethStatus.slice(0, 5).map((tooth) => (
                <span 
                  key={tooth.toothNumber}
                  className={`
                    px-2 py-1 rounded-md text-xs font-medium
                    ${isDarkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  #{tooth.toothNumber}
                </span>
              ))}
              {treatment.teethStatus.length > 5 && (
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  +{treatment.teethStatus.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Priority Indicator */}
        {treatment.priority && (
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className={getPriorityColor(treatment.priority)} />
            <span className={`text-sm font-medium ${getPriorityColor(treatment.priority)}`}>
              {treatment.priority} Priority
            </span>
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
      </Card.Content>

      {/* Quick Actions Footer */}
      <Card.Footer className="pt-3">
        <div className="flex gap-2 text-xs">
          {treatment.treatmentStatus === 'In Progress' && (
            <>
              <span className={`
                px-2 py-1 rounded-md flex items-center gap-1
                ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}
              `}>
                <FaClock className="w-3 h-3" />
                In Progress
              </span>
              {remainingBalance > 0 && (
                <span className={`
                  px-2 py-1 rounded-md flex items-center gap-1
                  ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}
                `}>
                  <FaDollarSign className="w-3 h-3" />
                  Payment Due
                </span>
              )}
            </>
          )}
          {treatment.treatmentStatus === 'Completed' && (
            <span className={`
              px-2 py-1 rounded-md flex items-center gap-1
              ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}
            `}>
              <FaCheck className="w-3 h-3" />
              Completed
            </span>
          )}
        </div>
      </Card.Footer>
    </Card>
  )
}

export default TreatmentPlanCard
