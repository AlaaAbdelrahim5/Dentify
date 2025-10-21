import { useTheme } from '../contexts/ThemeContext'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

/**
 * StatusBadge Component
 * Displays a status badge with icon and label
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {boolean} isActive - Whether the status is active
 * @param {string} activeLabel - Label for active status (default: 'Active')
 * @param {string} inactiveLabel - Label for inactive status (default: 'Inactive')
 * @param {ReactComponent} activeIcon - Custom icon for active status
 * @param {ReactComponent} inactiveIcon - Custom icon for inactive status
 * @param {string} status - Status type: 'active', 'inactive', 'pending' (overrides isActive)
 */
const StatusBadge = ({ 
  isActive, 
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  activeIcon: ActiveIcon = FaCheckCircle,
  inactiveIcon: InactiveIcon = FaTimesCircle,
  status
}) => {
  const { isDarkMode } = useTheme()
  
  // Determine the status type
  let statusType = 'inactive'
  if (status) {
    statusType = status.toLowerCase()
  } else if (isActive) {
    statusType = 'active'
  }
  
  // Determine icon and label based on status
  let Icon = InactiveIcon
  let label = inactiveLabel
  
  if (statusType === 'active') {
    Icon = ActiveIcon
    label = activeLabel
  } else if (statusType === 'pending') {
    Icon = InactiveIcon
    label = 'Pending'
  } else if (statusType === 'rejected') {
    Icon = InactiveIcon
    label = 'Rejected'
  }

  // Color classes based on status
  const colorClasses = 
    statusType === 'active'
      ? isDarkMode 
        ? 'bg-green-900/20 text-green-400 border-green-800'
        : 'bg-green-100 text-green-800 border-green-200'
      : statusType === 'pending'
      ? isDarkMode
        ? 'bg-orange-900/20 text-orange-400 border-orange-800'
        : 'bg-orange-100 text-orange-700 border-orange-200'
      : statusType === 'rejected'
      ? isDarkMode
        ? 'bg-red-900/20 text-red-400 border-red-800'
        : 'bg-red-100 text-red-800 border-red-200'
      : isDarkMode
        ? 'bg-gray-900/20 text-gray-400 border-gray-800'
        : 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

export default StatusBadge
