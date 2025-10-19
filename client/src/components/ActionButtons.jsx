import { useTheme } from '../contexts/ThemeContext'

/**
 * ActionButtons Component
 * Displays a row of action buttons for table rows
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {Array} actions - Array of action objects with structure:
 *   {
 *     icon: ReactComponent,
 *     onClick: Function,
 *     title: string,
 *     className: string (optional),
 *     variant: 'default' | 'success' | 'danger' | 'warning' (optional)
 *   }
 */
const ActionButtons = ({ actions }) => {
  const { isDarkMode } = useTheme()

  const getVariantClasses = (variant) => {
    switch (variant) {
      case 'success':
        return 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
      case 'danger':
        return 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
      case 'warning':
        return 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20'
      default:
        return isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon
        const variantClasses = getVariantClasses(action.variant)
        
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-2 rounded-lg transition-colors ${variantClasses} ${action.className || ''}`}
            title={action.title}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

export default ActionButtons
