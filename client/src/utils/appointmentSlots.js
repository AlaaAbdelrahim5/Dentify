import { addMinutes } from './helpers'

/**
 * Generate time slots based on working hours and appointment duration
 * @param {Object} workingHours - Working hours object with start, end, breaks, and isWorking flag
 * @param {number} duration - Appointment duration in minutes (default: 30)
 * @returns {Array<string>} Array of time slots in HH:MM format
 */
export const generateTimeSlotsFromWorkingHours = (workingHours, duration = 30) => {
  if (!workingHours || !workingHours.isWorking) {
    return []
  }

  const slots = []
  const [startHour, startMinute] = workingHours.start.split(':').map(Number)
  const [endHour, endMinute] = workingHours.end.split(':').map(Number)
  
  // Convert end time to minutes for easier comparison
  const endTimeInMinutes = endHour * 60 + endMinute
  
  let currentHour = startHour
  let currentMinute = startMinute

  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    // Calculate appointment end time
    const slotStartInMinutes = currentHour * 60 + currentMinute
    const slotEndInMinutes = slotStartInMinutes + duration
    
    // Check if appointment fits within working hours
    if (slotEndInMinutes > endTimeInMinutes) {
      // Appointment would extend beyond working hours, stop generating slots
      break
    }
    
    // Check if this slot overlaps with a break
    let isDuringBreak = false
    let breakEndTime = null
    if (workingHours.breaks && Array.isArray(workingHours.breaks)) {
      for (const breakPeriod of workingHours.breaks) {
        const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number)
        const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number)
        
        const slotMinutes = currentHour * 60 + currentMinute
        const breakStartMinutes = breakStartHour * 60 + breakStartMinute
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute
        
        // Check if slot overlaps with break: slot starts before break ends AND slot ends after break starts
        if (slotMinutes < breakEndMinutes && slotEndInMinutes > breakStartMinutes) {
          isDuringBreak = true
          breakEndTime = { hour: breakEndHour, minute: breakEndMinute }
          break
        }
      }
    }
    
    if (isDuringBreak && breakEndTime) {
      // Skip to the end of the break
      currentHour = breakEndTime.hour
      currentMinute = breakEndTime.minute
      continue
    }
    
    slots.push(timeSlot)
    
    // Move to next slot
    currentMinute += duration
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
  }

  return slots
}

/**
 * Mark booked slots based on existing appointments
 * @param {Array<string>} slots - Available time slots
 * @param {Array<Object>} appointments - Existing appointments with startTime and endTime
 * @param {string} date - Date string for the appointments
 * @param {number} duration - Appointment duration in minutes
 * @returns {Array<string>} Array of booked time slots
 */
export const getBookedSlots = (slots, appointments, date, duration) => {
  const booked = []
  
  slots.forEach(slot => {
    const [slotHour, slotMinute] = slot.split(':').map(Number)
    const slotStart = new Date(date)
    slotStart.setHours(slotHour, slotMinute, 0, 0)
    const slotEnd = addMinutes(slotStart, duration)
    
    // Check if this slot overlaps with any existing appointment
    const hasOverlap = appointments.some(apt => {
      const aptStart = new Date(apt.startTime)
      const aptEnd = new Date(apt.endTime)
      
      // Check for overlap: slot overlaps if it starts before apt ends AND ends after apt starts
      return slotStart < aptEnd && slotEnd > aptStart
    })
    
    if (hasOverlap) {
      booked.push(slot)
    }
  })
  
  return booked
}

/**
 * Fetch and process available slots for a dentist on a specific date
 * @param {Function} apiCall - API function to fetch slots
 * @param {string|number} dentistId - Dentist ID
 * @param {string} date - Date string
 * @returns {Promise<Object>} Object with slots, bookedSlots, and appointmentDuration
 */
export const fetchAvailableSlotsData = async (apiCall, dentistId, date) => {
  try {
    const response = await apiCall(dentistId, date)
    
    // Store the dentist's appointment duration
    const duration = response.appointmentDuration || 30
    
    // Generate time slots based on working hours
    const slots = generateTimeSlotsFromWorkingHours(
      response.workingHours,
      duration
    )
    
    // Mark booked slots
    const bookedSlots = getBookedSlots(
      slots,
      response.appointments || [],
      date,
      duration
    )
    
    return {
      slots,
      bookedSlots,
      appointmentDuration: duration,
      workingHours: response.workingHours
    }
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return {
      slots: [],
      bookedSlots: [],
      appointmentDuration: 30,
      workingHours: null
    }
  }
}
