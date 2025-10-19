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
 */
const StatusBadge = ({ 
  isActive, 
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  activeIcon: ActiveIcon = FaCheckCircle,
  inactiveIcon: InactiveIcon = FaTimesCircle
}) => {
  const { isDarkMode } = useTheme()
  
  const Icon = isActive ? ActiveIcon : InactiveIcon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
      isActive
        ? isDarkMode 
          ? 'bg-green-900/20 text-green-400 border-green-800'
          : 'bg-green-100 text-green-800 border-green-200'
        : isDarkMode
          ? 'bg-red-900/20 text-red-400 border-red-800'
          : 'bg-red-100 text-red-800 border-red-200'
    }`}>
      <Icon className="w-3 h-3" />
      {isActive ? activeLabel : inactiveLabel}
    </span>
  )
}

export default StatusBadge
