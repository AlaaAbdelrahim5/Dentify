/**
 * Utility helper functions for common operations
 */

/**
 * Calculate age from date of birth
 * @param {string|Date} dateOfBirth - The date of birth
 * @returns {number|string} Age in years or 'N/A' if invalid
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A'
  
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  
  if (isNaN(birthDate.getTime())) return 'N/A'
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format date to readable string
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Not scheduled'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get status display configuration (label and className)
 * @param {string} status - Status value
 * @returns {object} Object with label and className
 */
export const getStatusDisplay = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
      }
    case 'inactive':
      return {
        label: 'Inactive',
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
      }
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
      }
    case 'deactivated':
      return {
        label: 'Deactivated',
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
      }
    default:
      return {
        label: 'Active',
        className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
      }
  }
}

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
  if (amount == null || isNaN(amount)) return `${currency}0.00`
  return `${currency}${Number(amount).toFixed(2)}`
}

/**
 * Get initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get status color classes based on status and theme
 * @param {string} status - Status value
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @returns {string} Tailwind CSS classes for status badge
 */
export const getStatusColor = (status, isDarkMode = false) => {
  const normalizedStatus = status?.toUpperCase()
  
  switch (normalizedStatus) {
    case 'REQUESTED':
    case 'PENDING':
      return isDarkMode 
        ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' 
        : 'bg-yellow-100 text-yellow-700 border-yellow-400'
    
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return isDarkMode 
        ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
        : 'bg-blue-100 text-blue-700 border-blue-400'
    
    case 'COMPLETED':
      return isDarkMode 
        ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
        : 'bg-blue-100 text-blue-700 border-blue-400'
    
    case 'CANCELLED':
    case 'CANCELED':
      return isDarkMode 
        ? 'bg-red-900/30 text-red-400 border-red-600' 
        : 'bg-red-100 text-red-700 border-red-400'
    
    case 'SCHEDULED':
    case 'CONFIRMED':
      return isDarkMode 
        ? 'bg-green-900/30 text-green-400 border-green-600' 
        : 'bg-green-100 text-green-700 border-green-400'
    
    case 'ACTIVE':
      return isDarkMode 
        ? 'bg-green-900/30 text-green-400 border-green-600' 
        : 'bg-green-100 text-green-700 border-green-400'
    
    case 'INACTIVE':
    case 'DEACTIVATED':
      return isDarkMode 
        ? 'bg-gray-900/30 text-gray-400 border-gray-600' 
        : 'bg-gray-100 text-gray-700 border-gray-400'
    
    case 'REJECTED':
      return isDarkMode 
        ? 'bg-red-900/30 text-red-400 border-red-600' 
        : 'bg-red-100 text-red-700 border-red-400'
    
    default:
      return isDarkMode 
        ? 'bg-gray-900/30 text-gray-400 border-gray-600' 
        : 'bg-gray-100 text-gray-700 border-gray-400'
  }
}

/**
 * Check if text matches search term (case-insensitive)
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Search term
 * @returns {boolean} Whether text matches search term
 */
export const matchesSearch = (text, searchTerm) => {
  if (!searchTerm) return true
  if (!text) return false
  return text.toLowerCase().includes(searchTerm.toLowerCase())
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
export const toISODateString = (date) => {
  if (!date) return new Date().toISOString().split('T')[0]
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 * @returns {string} Today's date in ISO format
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Format time from date string
 * @param {string|Date} dateTime - DateTime to format
 * @param {boolean} use12Hour - Whether to use 12-hour format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateTime, use12Hour = true) => {
  if (!dateTime) return ''
  
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: use12Hour
  })
}

/**
 * Format date with custom locale options
 * @param {string|Date} dateString - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateWithOptions = (dateString, options = {}) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

/**
 * Convert 24-hour time format to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (h:MM AM/PM)
 */
export const convertTo12Hour = (time24) => {
  if (!time24) return ''
  
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${minutes} ${period}`
}

/**
 * Sort array by date field (ascending)
 * @param {Array} array - Array to sort
 * @param {string} dateField - Field name containing date
 * @returns {Array} Sorted array
 */
export const sortByDateAsc = (array, dateField) => {
  return [...array].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]))
}

/**
 * Sort array by date field (descending)
 * @param {Array} array - Array to sort
 * @param {string} dateField - Field name containing date
 * @returns {Array} Sorted array
 */
export const sortByDateDesc = (array, dateField) => {
  return [...array].sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]))
}

/**
 * Calculate remaining balance for treatment
 * @param {number} totalAmount - Total treatment amount
 * @param {number} paidAmount - Amount already paid
 * @param {number} discount - Discount amount (optional)
 * @returns {number} Remaining balance
 */
export const calculateRemainingBalance = (totalAmount, paidAmount, discount = 0) => {
  return (totalAmount || 0) - (discount || 0) - (paidAmount || 0)
}

/**
 * Safely parse JSON string, returns default value if parsing fails
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value to return on parse failure
 * @returns {*} Parsed object or default value
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return defaultValue
  }
}

/**
 * Add minutes to a date
 * @param {Date} date - The date object
 * @param {number} minutes - Number of minutes to add
 * @returns {Date} New date with added minutes
 */
export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000)
}

/**
 * Ensure value is an array, return empty array if not
 * @param {*} value - Value to check
 * @returns {Array} Array value or empty array
 */
export const ensureArray = (value) => {
  return Array.isArray(value) ? value : []
}

/**
 * Get full image URL from profile image path
 * @param {string} profileImage - Profile image path (can be base64, full URL, or relative path)
 * @returns {string|null} Full image URL or null
 */
export const getImageUrl = (profileImage) => {
  if (!profileImage) return null
  if (profileImage.startsWith('data:')) return profileImage // base64 image
  if (profileImage.startsWith('http')) return profileImage // full URL
  return `${import.meta.env.VITE_API_URL}${profileImage}` // relative path
}

/**
 * Sum a specific field from an array of objects
 * @param {Array} array - Array of objects
 * @param {string} field - Field to sum
 * @returns {number} Sum of field values
 */
export const sumField = (array, field) => {
  return array.reduce((sum, item) => sum + (item[field] || 0), 0)
}

/**
 * Count items in array matching a condition
 * @param {Array} array - Array to filter
 * @param {Function} condition - Condition function
 * @returns {number} Count of matching items
 */
export const countWhere = (array, condition) => {
  return array.filter(condition).length
}

/**
 * Normalize treatment status to uppercase
 * @param {string} status - Treatment status
 * @returns {string} Normalized status
 */
export const normalizeStatus = (status) => {
  const statusMap = {
    'In Progress': 'IN_PROGRESS',
    'IN_PROGRESS': 'IN_PROGRESS',
    'Completed': 'COMPLETED',
    'COMPLETED': 'COMPLETED',
    'Pending': 'PENDING',
    'PENDING': 'PENDING',
    'Cancelled': 'CANCELLED',
    'CANCELLED': 'CANCELLED'
  }
  return statusMap[status] || status
}
