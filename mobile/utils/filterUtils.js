/**
 * Filter utility functions for appointments, treatments, and radiology
 */

/**
 * Filter appointments for today
 * @param {Array} appointments - Array of appointment objects
 * @returns {Array} Today's appointments
 */
export const filterTodayAppointments = (appointments) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return appointments.filter(apt => {
    const aptDate = new Date(apt.startTime || apt.appointmentDate || apt.appointmentDateTime);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });
};

/**
 * Filter upcoming appointments (future confirmed appointments)
 * @param {Array} appointments - Array of appointment objects
 * @param {string} role - User role ('dentist', 'secretary', 'patient')
 * @returns {Array} Upcoming appointments
 */
export const filterUpcomingAppointments = (appointments, role = 'patient') => {
  const now = new Date();
  return appointments.filter(apt => {
    const aptDate = new Date(apt.startTime || apt.appointmentDate || apt.appointmentDateTime);
    const isFuture = aptDate >= now;
    
    // For dentist and secretary, show only CONFIRMED appointments
    if (role === 'dentist' || role === 'secretary') {
      return isFuture && apt.status === 'CONFIRMED';
    }
    
    // For patient, show all future appointments except cancelled/completed
    return isFuture && 
           apt.status !== 'CANCELLED' && 
           apt.status !== 'COMPLETED';
  }).sort((a, b) => {
    const dateA = new Date(a.startTime || a.appointmentDate || a.appointmentDateTime);
    const dateB = new Date(b.startTime || b.appointmentDate || b.appointmentDateTime);
    return dateA - dateB;
  });
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
