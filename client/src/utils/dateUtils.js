/**
 * Date utility functions
 * DEPRECATED: This file now re-exports from helpers.js
 * All date utilities have been consolidated into helpers.js
 * This file is kept for backward compatibility
 */

// Re-export date utilities from helpers.js to maintain backward compatibility
export { 
  formatDate, 
  formatTime, 
  formatDateWithOptions, 
  toISODateString, 
  getTodayISO, 
  convertTo12Hour,
  formatDistanceToNow,
  formatDateTime,
  addMinutes,
  sortByDateAsc,
  sortByDateDesc
} from './helpers'
