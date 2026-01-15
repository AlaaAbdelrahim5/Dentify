const prisma = require('../../config/database');

/**
 * Standard include configuration for appointment queries
 * Includes patient, dentist, clinic with user details, and treatment info
 */
const appointmentInclude = {
  patient: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          profileImage: true
        }
      }
    }
  },
  dentist: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          profileImage: true
        }
      }
    }
  },
  clinic: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true
        }
      }
    }
  },
  treatment: {
    select: {
      id: true,
      treatmentName: true,
      description: true,
      status: true
    }
  }
};

/**
 * Auto-cancel pending appointments that have passed their end time
 * @param {Object} whereCondition - Additional where conditions (e.g., { patientId: 123 })
 * @returns {Promise<Object>} Prisma update result
 */
async function autoCancelExpiredAppointments(whereCondition = {}) {
  const now = new Date();
  return await prisma.appointment.updateMany({
    where: {
      ...whereCondition,
      status: 'PENDING',
      endTime: {
        lt: now
      }
    },
    data: {
      status: 'CANCELLED'
    }
  });
}

/**
 * Get clinic ID for the current user
 * If user is a secretary, fetches their associated clinic ID
 * If user is a clinic, returns their user ID
 * @param {Object} user - User object with id and role
 * @returns {Promise<number|null>} Clinic ID or null if not found
 */
async function getClinicIdForUser(user) {
  if (user.role === 'Secretary') {
    const secretary = await prisma.secretary.findUnique({
      where: { userId: user.id },
      select: { clinicId: true }
    });
    return secretary ? secretary.clinicId : null;
  }
  return user.id;
}

/**
 * Format date and time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Generate available time slots for a dentist on a specific date
 * @param {Object} dentist - Dentist object with workingHours and appointmentDuration
 * @param {Date} date - Date to check for available slots
 * @param {Array} existingAppointments - Array of existing appointments with startTime and endTime
 * @param {Object} options - Optional filters { timePreference: 'morning'|'afternoon'|'evening' }
 * @returns {Array} Array of available slot objects
 */
function generateAvailableSlots(dentist, date, existingAppointments = [], options = {}) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[date.getDay()];
  const slots = [];
  
  // Get working hours for the day
  let workingHours = null;
  if (dentist.workingHours && Array.isArray(dentist.workingHours)) {
    workingHours = dentist.workingHours.find(day => day.day === dayOfWeek);
  }
  
  if (!workingHours || !workingHours.start || !workingHours.end) {
    return []; // Dentist doesn't work on this day
  }
  
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  const duration = dentist.appointmentDuration || 30;
  
  // Set time range filter if specified
  let timeRangeStart = null;
  let timeRangeEnd = null;
  if (options.timePreference) {
    const pref = options.timePreference.toLowerCase();
    if (pref === 'morning') {
      timeRangeStart = 8;
      timeRangeEnd = 12;
    } else if (pref === 'afternoon') {
      timeRangeStart = 12;
      timeRangeEnd = 17;
    } else if (pref === 'evening') {
      timeRangeStart = 17;
      timeRangeEnd = 20;
    }
  }
  
  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const now = new Date();
  
  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + duration);
    
    // Ensure slot end doesn't exceed working hours
    if (slotEnd > endTime) {
      break;
    }
    
    const slotHour = currentTime.getHours();
    
    // Check if slot is in the future
    if (currentTime > now) {
      // Check time preference filter
      if (timeRangeStart !== null && timeRangeEnd !== null) {
        if (slotHour < timeRangeStart || slotHour >= timeRangeEnd) {
          currentTime.setMinutes(currentTime.getMinutes() + duration);
          continue;
        }
      }
      
      // Check if slot is during break
      let isDuringBreak = false;
      if (workingHours.breaks && Array.isArray(workingHours.breaks)) {
        for (const breakTime of workingHours.breaks) {
          const [breakStartHour, breakStartMinute] = breakTime.start.split(':').map(Number);
          const [breakEndHour, breakEndMinute] = breakTime.end.split(':').map(Number);
          const breakStart = new Date(date);
          breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
          const breakEnd = new Date(date);
          breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);
          
          if (currentTime < breakEnd && slotEnd > breakStart) {
            isDuringBreak = true;
            break;
          }
        }
      }
      
      if (!isDuringBreak) {
        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          return currentTime < apt.endTime && slotEnd > apt.startTime;
        });
        
        if (!hasConflict) {
          slots.push({
            startTime: new Date(currentTime),
            endTime: new Date(slotEnd),
            time: `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`
          });
        }
      }
    }
    
    currentTime.setMinutes(currentTime.getMinutes() + duration);
  }
  
  return slots;
}

module.exports = {
  appointmentInclude,
  autoCancelExpiredAppointments,
  getClinicIdForUser,
  formatDateTime,
  generateAvailableSlots
};
