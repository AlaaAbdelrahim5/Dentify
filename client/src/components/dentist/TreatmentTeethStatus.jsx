import { useTheme } from '../../contexts/ThemeContext'
import { FaTooth, FaExclamationTriangle } from 'react-icons/fa'

/**
 * Component to display affected teeth in a treatment with their conditions
 */
const TreatmentTeethStatus = ({ teethStatus = [], compact = false }) => {
  const { isDarkMode } = useTheme()

  if (!teethStatus || teethStatus.length === 0) {
    return (
      <div className={`text-center py-4 ${
        isDarkMode ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <FaTooth className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No teeth specified</p>
      </div>
    )
  }

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'healthy':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'cavity':
        return isDarkMode 
          ? 'bg-orange-900/30 text-orange-400 border-orange-600' 
          : 'bg-orange-100 text-orange-700 border-orange-400'
      case 'root canal':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      case 'crown':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'extracted':
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-500 border-gray-600' 
          : 'bg-gray-100 text-gray-500 border-gray-400'
      case 'implant':
        return isDarkMode 
          ? 'bg-purple-900/30 text-purple-400 border-purple-600' 
          : 'bg-purple-100 text-purple-700 border-purple-400'
      case 'filling':
        return isDarkMode 
          ? 'bg-indigo-900/30 text-indigo-400 border-indigo-600' 
          : 'bg-indigo-100 text-indigo-700 border-indigo-400'
      case 'bridge':
        return isDarkMode 
          ? 'bg-cyan-900/30 text-cyan-400 border-cyan-600' 
          : 'bg-cyan-100 text-cyan-700 border-cyan-400'
      default:
        return isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-600' 
          : 'bg-white text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-orange-500'
      case 'low':
        return 'text-green-500'
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }
  }

  if (compact) {
    // Compact view - just show tooth numbers and conditions
    return (
      <div className="flex flex-wrap gap-2">
        {teethStatus.map((tooth, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              getConditionColor(tooth.conditionStatus)
            } flex items-center gap-1`}
          >
            <FaTooth className="w-3 h-3" />
            <span>#{tooth.toothNumber}</span>
            {tooth.treatmentPriority?.toLowerCase() === 'high' && (
              <FaExclamationTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Full view - detailed cards
  return (
    <div className="space-y-3">
      {teethStatus.map((tooth, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                getConditionColor(tooth.conditionStatus)
              }`}>
                <FaTooth className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Tooth #{tooth.toothNumber}
                </h4>
                <p className={`text-sm capitalize ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {tooth.conditionStatus || 'No condition specified'}
                </p>
              </div>
            </div>
            {tooth.treatmentPriority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                tooth.treatmentPriority.toLowerCase() === 'high'
                  ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600'
                  : tooth.treatmentPriority.toLowerCase() === 'medium'
                    ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600'
                    : 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
              }`}>
                {tooth.treatmentPriority} Priority
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {tooth.diagnosedDate && (
              <div>
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-xs`}>
                  Diagnosed Date
                </p>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {new Date(tooth.diagnosedDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          {tooth.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                Notes
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {tooth.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default TreatmentTeethStatus
