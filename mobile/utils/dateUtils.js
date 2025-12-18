/**
 * Date formatting utilities for the mobile app
 */

/**
 * Format a date string to a localized date and time object
 * @param {string} dateString - The date string to format
 * @returns {object} Object containing formatted date, time, and optional day
 */
export const formatDateTime = (dateString, includeDay = false) => {
  const date = new Date(dateString);
  const result = {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  };
  
  if (includeDay) {
    result.day = date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  return result;
};

/**
 * Format a date string to a short localized date
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Format a date string to a full localized date and time string
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date and time string
 */
export const formatFullDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date string to just the time
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
