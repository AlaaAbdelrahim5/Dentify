import { useTheme } from '../../../contexts/ThemeContext'
import Card from '../layout/Card'

/**
 * StatsOverview Component
 * Displays statistics cards in a grid layout
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {Array} stats - Array of stat objects with structure:
 *   {
 *     label: string,
 *     value: number,
 *     icon: ReactComponent,
 *     gradient: string (e.g., 'from-teal-600 to-cyan-600')
 *   }
 */
const StatsOverview = ({ stats }) => {
  const { isDarkMode } = useTheme()
  
  // Determine grid columns based on number of stats
  const gridCols = stats.length === 4 
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
    : 'grid-cols-1 md:grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full bg-linear-to-r ${stat.gradient} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default StatsOverview
