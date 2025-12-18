/**
 * Filter utility functions for appointments, treatments, and radiology
 */

/**
 * Filter appointments for today
 * @param {Array} appointments - Array of appointment objects
 * @returns {Array} Today's appointments
 */
export const filterTodayAppointments = (appointments) => {
  const today = new Date().toDateString();
  return appointments.filter(apt => 
    new Date(apt.appointmentDateTime).toDateString() === today
  );
};

/**
 * Filter upcoming appointments (future dates, not cancelled)
 * @param {Array} appointments - Array of appointment objects
 * @returns {Array} Upcoming appointments
 */
export const filterUpcomingAppointments = (appointments) => {
  const today = new Date();
  return appointments.filter(apt => 
    new Date(apt.appointmentDateTime) > today &&
    apt.status !== 'CANCELLED'
  );
};

/**
 * Filter items by status
 * @param {Array} items - Array of items to filter
 * @param {string} status - Status to filter by ('all' returns all items)
 * @returns {Array} Filtered items
 */
export const filterByStatus = (items, status) => {
  if (status === 'all') return items;
  return items.filter(item => item.status === status);
};

/**
 * Count items by status
 * @param {Array} items - Array of items
 * @param {string} status - Status to count
 * @returns {number} Count of items with that status
 */
export const countByStatus = (items, status) => {
  return items.filter(item => item.status === status).length;
};
