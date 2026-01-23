/**
 * Appointment scheduling utility functions
 * Shared logic for time slot generation and booking validation
 */

/**
 * Generate time slots based on working hours and break periods
 * @param {Object} workingHours - Working hours configuration { isWorking, start, end, breaks }
 * @param {number} duration - Appointment duration in minutes (default: 30)
 * @returns {Array<string>} Array of time slots in "HH:MM" format
 */
export const generateTimeSlots = (workingHours, duration = 30) => {
  if (!workingHours || !workingHours.isWorking) return [];

  const slots = [];
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const slotStartInMinutes = currentHour * 60 + currentMinute;
    const slotEndInMinutes = slotStartInMinutes + duration;
    
    if (slotEndInMinutes > endTimeInMinutes) break;
    
    // Check if slot overlaps with a break
    let isDuringBreak = false;
    if (workingHours.breaks && Array.isArray(workingHours.breaks)) {
      for (const breakPeriod of workingHours.breaks) {
        const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number);
        const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute;
        
        // Check if slot overlaps with break: slot starts before break ends AND slot ends after break starts
        if (slotStartInMinutes < breakEndMinutes && slotEndInMinutes > breakStartMinutes) {
          isDuringBreak = true;
          currentHour = breakEndHour;
          currentMinute = breakEndMinute;
          break;
        }
      }
    }
    
    if (!isDuringBreak) {
      slots.push(timeSlot);
    }
    
    currentMinute += duration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

/**
 * Find which time slots are already booked
 * @param {Array<string>} slots - Available time slots
 * @param {Array<Object>} appointments - Existing appointments with startTime and endTime
 * @param {number} duration - Appointment duration in minutes
 * @param {string} date - Date string for the appointments
 * @returns {Array<string>} Array of booked time slots
 */
export const findBookedSlots = (slots, appointments, duration, date) => {
  const booked = [];
  
  slots.forEach(slot => {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(slotHour, slotMinute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);
    
    const hasOverlap = appointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return slotStart < aptEnd && slotEnd > aptStart;
    });
    
    if (hasOverlap) {
      booked.push(slot);
    }
  });
  
  return booked;
};

/**
 * Check if a time slot is available (not booked)
 * @param {string} timeSlot - Time slot in "HH:MM" format
 * @param {Array<string>} bookedSlots - Array of booked time slots
 * @returns {boolean} True if slot is available
 */
export const isSlotAvailable = (timeSlot, bookedSlots) => {
  return !bookedSlots.includes(timeSlot);
};

/**
 * Validate if appointment time is in the future
 * @param {string} date - Date string
 * @param {string} time - Time in "HH:MM" format
 * @returns {boolean} True if appointment is in the future
 */
export const isAppointmentInFuture = (date, time) => {
  const [hours, minutes] = time.split(':');
  const appointmentDate = new Date(date);
  appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  const now = new Date();
  
  return appointmentDate > now;
};
