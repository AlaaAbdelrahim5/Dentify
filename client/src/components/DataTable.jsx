import { Card, LoadingSpinner } from './'
import { useTheme } from '../contexts/ThemeContext'

/**
 * DataTable Component
 * Displays data in a table format with loading and empty states
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {Array} columns - Array of column objects with structure:
 *   {
 *     key: string,
 *     label: string,
 *     className: string (optional)
 *   }
 * @param {Array} data - Array of data objects to display
 * @param {Function} renderRow - Function to render each row, receives (item, index)
 * @param {boolean} loading - Loading state
 * @param {string} emptyMessage - Message to show when no data
 * @param {ReactComponent} emptyIcon - Icon to show when no data
 * @param {string} emptyTitle - Title to show when no data
 * @param {boolean} hasFilters - Whether filters are active (affects empty message)
 */
const DataTable = ({ 
  columns, 
  data, 
  renderRow,
  loading = false,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  emptyTitle = "No results",
  hasFilters = false
}) => {
  const { isDarkMode } = useTheme()

  return (
    <Card>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
      
      {!loading && data.length === 0 && (
        <div className="text-center py-12">
          {EmptyIcon && (
            <EmptyIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          )}
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {emptyTitle}
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {hasFilters ? 'Try adjusting your search criteria' : emptyMessage}
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {data.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default DataTable
