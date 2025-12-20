import React from 'react'
import { Card, LoadingSpinner } from './'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * DataTable Component
 * Displays data in a table format with loading and empty states
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * Two usage modes:
 * 
 * 1. With columns config (automatic rendering):
 *    @param {Array} columns - Array of column objects:
 *      {
 *        key: string (optional, for unique key),
 *        label: string (header label),
 *        accessor: string (property name to access in data object),
 *        render: function(value, item, index) (optional, custom renderer),
 *        className: string (optional, cell classes)
 *      }
 *    @param {Array} data - Array of data objects
 * 
 * 2. With renderRow function (manual rendering):
 *    @param {Array} columns - Array with { key, label, className }
 *    @param {Array} data - Array of data objects
 *    @param {Function} renderRow - Function(item, index) that returns a <tr> element
 * 
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
              ? 'bg-linear-to-br from-gray-700 to-gray-800' 
              : 'bg-linear-to-br from-gray-100 to-gray-200'
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
                ? 'bg-linear-to-r from-gray-800 to-gray-700 border-b border-gray-600' 
                : 'bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200'
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
              {data.map((item, index) => {
                // If renderRow function is provided, use it (it should return a <tr> with its own key)
                if (renderRow) {
                  // Extract the key from item.id or use index as fallback
                  const rowKey = item.id || item._id || index
                  return <React.Fragment key={rowKey}>{renderRow(item, index)}</React.Fragment>
                }
                
                // Otherwise, render using columns config
                return (
                  <tr key={item.id || item._id || index} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    {columns.map((column, colIndex) => {
                      const value = column.accessor ? item[column.accessor] : null
                      const cellContent = column.render ? column.render(value, item, index) : value
                      
                      return (
                        <td
                          key={column.key || column.accessor || colIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          } ${column.className || ''}`}
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
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
