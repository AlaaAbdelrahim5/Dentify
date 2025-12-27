import { useTheme } from '../../../contexts/ThemeContext'

/**
 * WelcomeCard Component
 * Consistent welcome section for all dashboard overview pages
 * 
 * @param {string} title - Main welcome title
 * @param {string} subtitle - Subtitle text (optional)
 * @param {React.Component} icon - Icon component (optional)
 * @param {string} iconGradient - Gradient classes for icon background
 */
const WelcomeCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconGradient = 'from-teal-600 to-cyan-600' 
}) => {
  const { isDarkMode } = useTheme()

  return (
    <div className={`p-6 rounded-xl shadow-lg ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${iconGradient}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeCard
