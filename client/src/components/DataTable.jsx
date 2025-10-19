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
    <Card className="overflow-hidden">
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading data...
          </p>
        </div>
      )}
      
      {!loading && data.length === 0 && (
        <div className="text-center py-16 px-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            {EmptyIcon && (
              <EmptyIcon className={`w-10 h-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {emptyTitle}
          </h3>
          <p className={`text-sm max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {hasFilters ? 'Try adjusting your search criteria or clear filters to see all results.' : emptyMessage}
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'
            }`}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    } ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`${
              isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'
            } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {data.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Data count footer */}
      {!loading && data.length > 0 && (
        <div className={`px-6 py-3 border-t ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-400' 
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          <p className="text-sm">
            Showing <span className="font-semibold">{data.length}</span> {data.length === 1 ? 'result' : 'results'}
          </p>
        </div>
      )}
    </Card>
  )
}

export default DataTable
