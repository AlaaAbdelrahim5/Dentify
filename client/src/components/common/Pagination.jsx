import { Button } from './'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Pagination Component
 * Displays pagination controls with page info and navigation buttons
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Page change handler
 * @param {boolean} show - Whether to show pagination (default: show when totalPages > 1)
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  show = totalPages > 1
}) => {
  const { isDarkMode } = useTheme()

  if (!show) return null

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Pagination
