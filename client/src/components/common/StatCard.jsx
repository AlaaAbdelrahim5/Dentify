import { useTheme } from '../../contexts/ThemeContext'
import { Card } from './'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

/**
 * StatCard Component
 * Enhanced statistics card with trend indicators and optional click handler
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {string} title - Card title/label
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Optional subtitle text
 * @param {ReactComponent} icon - Icon component to display
 * @param {string} trend - Trend direction: 'up' or 'down'
 * @param {string} trendValue - Trend value to display (e.g., '+12%')
 * @param {string} gradient - Gradient classes for icon background (e.g., 'from-teal-600 to-cyan-600')
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  gradient = 'from-teal-600 to-cyan-600', 
  onClick,
  className = ''
}) => {
  const { isDarkMode } = useTheme()

  return (
    <Card 
      hover={onClick ? true : false} 
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <FaArrowUp className="text-green-500 text-sm" />
                ) : (
                  <FaArrowDown className="text-red-500 text-sm" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`w-16 h-16 rounded-lg bg-linear-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}

export default StatCard
