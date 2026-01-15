import Input from '../forms/Input'
import Button from '../forms/Button'
import LoadingSpinner from '../states/LoadingSpinner'
import { useTheme } from '../../../contexts/ThemeContext'
import { FaSearch, FaFilter } from 'react-icons/fa'

/**
 * FilterBar Component
 * Provides search and filter functionality
 * Reusable across all dashboards (Admin, Clinic, Dentist, Patient)
 * 
 * @param {string} searchTerm - Current search term
 * @param {Function} onSearchChange - Search term change handler
 * @param {string} debouncedSearchTerm - Debounced search term for loading indicator
 * @param {Array} filters - Array of filter objects with structure:
 *   {
 *     value: string,
 *     onChange: Function,
 *     options: Array<{value: string, label: string}>,
 *     placeholder: string,
 *     disabled: boolean (optional)
 *   }
 * @param {Function} onClearFilters - Clear filters handler
 * @param {boolean} filtering - Loading state for filters
 * @param {string} searchPlaceholder - Placeholder text for search input
 */
const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  debouncedSearchTerm,
  filters = [], 
  onClearFilters, 
  filtering = false,
  searchPlaceholder = "Search..."
}) => {
  const { isDarkMode } = useTheme()

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 pr-8"
          disabled={filtering}
        />
        {searchTerm !== debouncedSearchTerm && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Dynamic Filters */}
      {filters.map((filter, index) => (
        <select
          key={index}
          value={filter.value}
          onChange={filter.onChange}
          disabled={filtering || filter.disabled}
          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 min-w-[150px] ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {filter.placeholder && !filter.value && (
            <option value="">{filter.placeholder}</option>
          )}
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {/* Clear Filters Button */}
      <Button
        onClick={onClearFilters}
        variant="outline"
        className="flex items-center gap-2 whitespace-nowrap"
        disabled={filtering}
      >
        <FaFilter className="w-4 h-4" />
        Clear Filters
      </Button>
    </div>
  )
}

export default FilterBar
