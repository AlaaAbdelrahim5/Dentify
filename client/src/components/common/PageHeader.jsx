import { useTheme } from '../../contexts/ThemeContext'
import { Button } from './'

/**
 * PageHeader Component
 * Displays page title, description, and action button(s)
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {Object} action - Action button config (optional):
 *   {
 *     label: string,
 *     onClick: Function,
 *     icon: ReactComponent (optional),
 *     gradient: string (optional, e.g., 'from-teal-600 to-cyan-600')
 *   }
 * @param {ReactNode} actions - Custom action buttons JSX (alternative to action prop)
 */
const PageHeader = ({ title, description, action, actions }) => {
  const { isDarkMode } = useTheme()

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        {description && (
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
      {/* Support both single action object and custom actions JSX */}
      {actions ? (
        actions
      ) : action ? (
        <Button
          onClick={action.onClick}
          className={`flex items-center gap-2 ${action.gradient ? `bg-gradient-to-r ${action.gradient}` : ''}`}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

export default PageHeader
