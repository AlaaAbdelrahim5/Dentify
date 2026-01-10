import { useTheme } from '../../../contexts/ThemeContext'
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
 * @param {string} status - Status type: 'active', 'inactive', 'pending', 'rejected' (overrides isActive)
 * @param {ReactComponent} icon - Custom icon (overrides default icons)
 * @param {string} label - Custom label (overrides default labels)
 */
const StatusBadge = ({ 
  isActive, 
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  activeIcon: ActiveIcon = FaCheckCircle,
  inactiveIcon: InactiveIcon = FaTimesCircle,
  status,
  icon: CustomIcon,
  label: customLabel
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
  
  if (statusType === 'active' || statusType === 'confirmed' || statusType === 'completed') {
    Icon = ActiveIcon
    label = activeLabel
  } else if (statusType === 'pending') {
    Icon = InactiveIcon
    label = 'Pending'
  } else if (statusType === 'rejected' || statusType === 'cancelled') {
    Icon = InactiveIcon
    label = 'Rejected'
  }

  // Allow custom icon and label to override
  if (CustomIcon) Icon = CustomIcon
  if (customLabel) label = customLabel

  // Color classes based on status
  const colorClasses = 
    statusType === 'active' || statusType === 'confirmed'
      ? isDarkMode 
        ? 'bg-green-900/20 text-green-400 border-green-800'
        : 'bg-green-100 text-green-800 border-green-200'
      : statusType === 'completed'
      ? isDarkMode
        ? 'bg-blue-900/20 text-blue-400 border-blue-800'
        : 'bg-blue-100 text-blue-800 border-blue-200'
      : statusType === 'pending'
      ? isDarkMode
        ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
      : statusType === 'rejected' || statusType === 'cancelled'
      ? isDarkMode
        ? 'bg-red-900/20 text-red-400 border-red-800'
        : 'bg-red-100 text-red-800 border-red-200'
      : isDarkMode
        ? 'bg-red-900/20 text-red-400 border-red-800'
        : 'bg-red-100 text-red-800 border-red-200'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

export default StatusBadge
