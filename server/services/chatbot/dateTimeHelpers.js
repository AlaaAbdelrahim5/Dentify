/**
 * Date and Time Helper Utilities for Chatbot
 * Provides accurate parsing and formatting for appointment booking
 */

/**
 * Parse date string to YYYY-MM-DD format
 * @param {string} dateStr - Date string (e.g., "2026-01-20", "tomorrow", "next Monday")
 * @returns {string|null} - Formatted date string or null if invalid
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lowerDate = dateStr.toLowerCase().trim();
  
  // Handle "today"
  if (lowerDate === 'today') {
    return formatDateToYYYYMMDD(today);
  }
  
  // Handle "tomorrow"
  if (lowerDate === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToYYYYMMDD(tomorrow);
  }
  
  // Handle "next [day]"
  const nextDayMatch = lowerDate.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (nextDayMatch) {
    const targetDay = nextDayMatch[1];
    return getNextDayOfWeek(targetDay);
  }
  
  // Handle "in X days"
  const inDaysMatch = lowerDate.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    return formatDateToYYYYMMDD(futureDate);
  }
  
  // Try parsing as ISO date (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parsed = new Date(dateStr + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      return dateStr;
    }
  }
  
  // Try parsing as regular date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return formatDateToYYYYMMDD(parsed);
  }
  
  return null;
}

/**
 * Get next occurrence of a specific day of week
 * @param {string} dayName - Day name (e.g., "monday", "tuesday")
 * @returns {string} - Formatted date string (YYYY-MM-DD)
 */
function getNextDayOfWeek(dayName) {
  const days = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  
  const targetDay = days[dayName.toLowerCase()];
  if (targetDay === undefined) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = today.getDay();
  
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Next week
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  
  return formatDateToYYYYMMDD(nextDate);
}

/**
 * Format Date object to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse time string to 24-hour format (HH:MM)
 * @param {string} timeStr - Time string (e.g., "2 PM", "14:00", "9:30am")
 * @returns {string|null} - Formatted time string or null if invalid
 */
function parseTimeString(timeStr) {
  if (!timeStr) return null;
  
  const cleaned = timeStr.toLowerCase().trim().replace(/\s+/g, '');
  
  // Already in 24-hour format (HH:MM)
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [hours, minutes] = cleaned.split(':').map(Number);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
  
  // Handle 12-hour format with AM/PM
  const ampmMatch = cleaned.match(/^(\d{1,2}):?(\d{2})?(am|pm)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2]) : 0;
    const period = ampmMatch[3];
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
  
  return null;
}

/**
 * Calculate end time given start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string|null} - End time in HH:MM format or null if invalid
 */
function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return null;
  
  const parts = startTime.split(':');
  if (parts.length !== 2) return null;
  
  let hours = parseInt(parts[0]);
  let minutes = parseInt(parts[1]);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  // Add duration
  const totalMinutes = minutes + durationMinutes;
  hours += Math.floor(totalMinutes / 60);
  minutes = totalMinutes % 60;
  
  // Handle overflow past midnight
  if (hours >= 24) {
    hours = hours % 24;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Create ISO timestamp from date and time strings
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {string|null} - ISO timestamp or null if invalid
 */
function createISOTimestamp(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  
  const dateParts = dateStr.split('-');
  const timeParts = timeStr.split(':');
  
  if (dateParts.length !== 3 || timeParts.length !== 2) return null;
  
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
  const day = parseInt(dateParts[2]);
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  
  const date = new Date(year, month, day, hours, minutes, 0);
  
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString();
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * @param {string} time24 - Time in HH:MM format
 * @returns {string|null} - Time in 12-hour format or null if invalid
 */
function convertTo12Hour(time24) {
  if (!time24) return null;
  
  const parts = time24.split(':');
  if (parts.length !== 2) return null;
  
  let hours = parseInt(parts[0]);
  const minutes = parts[1];
  
  if (isNaN(hours) || hours < 0 || hours > 23) return null;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }
  
  return `${hours}:${minutes} ${period}`;
}

/**
 * Validate if a date is in the future
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {boolean} - True if date/time is in future
 */
function isFutureDateTime(dateStr, timeStr) {
  const timestamp = createISOTimestamp(dateStr, timeStr);
  if (!timestamp) return false;
  
  const appointmentDate = new Date(timestamp);
  const now = new Date();
  
  return appointmentDate > now;
}

/**
 * Get day of week from date string
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string|null} - Day name or null if invalid
 */
function getDayOfWeek(dateStr) {
  if (!dateStr) return null;
  
  const dateParts = dateStr.split('-');
  if (dateParts.length !== 3) return null;
  
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

module.exports = {
  parseDateString,
  parseTimeString,
  calculateEndTime,
  createISOTimestamp,
  convertTo12Hour,
  formatDateToYYYYMMDD,
  getNextDayOfWeek,
  isFutureDateTime,
  getDayOfWeek
};
