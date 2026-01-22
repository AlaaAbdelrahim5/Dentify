import { useState, useEffect, useMemo } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUser, FaClock, FaPlus } from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { Button } from '../../common'
import { convertTo12Hour } from '../../../utils/helpers'

const AppointmentSchedule = ({ appointments = [], onAddAppointment, onAppointmentClick, dentistData = null, onNavigateToSchedule }) => {
  const { isDarkMode } = useTheme()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // week or day
  
  // Filter out only cancelled appointments
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => 
      apt.status !== 'CANCELLED'
    )
    
    return filtered
  }, [appointments])

  // Get working days from dentist schedule
  const getWorkingDaysMap = useMemo(() => {
    const dayMap = {}
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours)) {
      // Default: Monday-Friday working
      return {
        1: true, // Monday
        2: true, // Tuesday
        3: true, // Wednesday
        4: true, // Thursday
        5: true, // Friday
      }
    }
    
    dentistData.workingHours.forEach(schedule => {
      const dayIndex = dayNames.indexOf(schedule.day)
      if (dayIndex !== -1 && schedule.isWorking !== false) {
        dayMap[dayIndex] = true
      }
    })
    
    return dayMap
  }, [dentistData])

  // Get week dates (only working days, starting from Sunday)
  const getWeekDates = (date) => {
    const current = new Date(date)
    current.setHours(0, 0, 0, 0) // Reset time to start of day
    
    const currentDay = current.getDay()
    // Calculate days to Sunday (start of week)
    const diff = -currentDay
    
    const sunday = new Date(current)
    sunday.setDate(current.getDate() + diff)
    
    const weekDates = []
    // Check all 7 days of the week starting from Sunday
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      const dayOfWeek = day.getDay()
      
      // Only include days that are working days
      if (getWorkingDaysMap[dayOfWeek]) {
        weekDates.push(day)
      }
    }
    
    return weekDates
  }

  const weekDates = useMemo(() => {
    const dates = getWeekDates(currentWeek)
    return dates
  }, [currentWeek, getWorkingDaysMap])

  // Check if working hours are configured
  const hasWorkingHours = useMemo(() => {
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours) || dentistData.workingHours.length === 0) {
      return false
    }
    
    // Check if at least one day has working hours set
    const hasAtLeastOneWorkingDay = dentistData.workingHours.some(schedule => 
      schedule.isWorking !== false && schedule.start && schedule.end
    )
    
    return hasAtLeastOneWorkingDay
  }, [dentistData])

  // Generate time slots based on dentist working hours and appointment duration
  const timeSlots = useMemo(() => {
    // Get appointment duration in minutes (default 30)
    const appointmentDuration = dentistData?.appointmentDuration || 30
    
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours) || dentistData.workingHours.length === 0) {
      // Return empty array if no working hours configured
      return []
    }

    // Collect all unique time slots across all working days (including breaks)
    const allSlotsSet = new Set()
    
    dentistData.workingHours.forEach(daySchedule => {
      if (!daySchedule.isWorking || !daySchedule.start || !daySchedule.end) {
        return
      }
      
      const [startHour, startMinute] = daySchedule.start.split(':').map(Number)
      const [endHour, endMinute] = daySchedule.end.split(':').map(Number)
      const endTimeInMinutes = endHour * 60 + endMinute
      
      let currentHour = startHour
      let currentMinute = startMinute
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const slotStartInMinutes = currentHour * 60 + currentMinute
        const slotEndInMinutes = slotStartInMinutes + appointmentDuration
        
        // Check if appointment fits within working hours
        if (slotEndInMinutes > endTimeInMinutes) {
          break
        }
        
        // Check if this slot is during a break
        let isDuringBreak = false
        let breakEndTime = null
        
        if (daySchedule.breaks && Array.isArray(daySchedule.breaks)) {
          for (const breakPeriod of daySchedule.breaks) {
            if (!breakPeriod.start || !breakPeriod.end) continue
            
            const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number)
            const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number)
            
            const breakStartMinutes = breakStartHour * 60 + breakStartMinute
            const breakEndMinutes = breakEndHour * 60 + breakEndMinute
            
            // Slot is during break if it starts within the break period
            if (slotStartInMinutes >= breakStartMinutes && slotStartInMinutes < breakEndMinutes) {
              isDuringBreak = true
              breakEndTime = { hour: breakEndHour, minute: breakEndMinute }
              break
            }
          }
        }
        
        // Add slot (including break slots)
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        allSlotsSet.add(timeSlot)
        
        if (isDuringBreak && breakEndTime) {
          // Skip to the end of the break for next iteration
          currentHour = breakEndTime.hour
          currentMinute = breakEndTime.minute
          continue
        }
        
        // Move to next slot
        currentMinute += appointmentDuration
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60)
          currentMinute = currentMinute % 60
        }
      }
    })
    
    // Convert to array and sort
    return Array.from(allSlotsSet).sort((a, b) => {
      const [aHour, aMin] = a.split(':').map(Number)
      const [bHour, bMin] = b.split(':').map(Number)
      return (aHour * 60 + aMin) - (bHour * 60 + bMin)
    })
  }, [dentistData])

  // Group filtered appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {}
    filteredAppointments.forEach(apt => {
      // Use startTime to determine the date (since it includes the actual appointment date/time)
      const aptDate = new Date(apt.startTime || apt.appointmentDate)
      aptDate.setHours(0, 0, 0, 0) // Reset time for consistent comparison
      const dateKey = aptDate.toDateString()
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(apt)
    })
    
    return grouped
  }, [filteredAppointments])

  // Check if a time slot would overlap with break time (considering appointment duration)
  const isBreakTime = (date, timeSlot) => {
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours)) {
      return false
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = dayNames[date.getDay()]
    
    // Find the schedule for this day
    const daySchedule = dentistData.workingHours.find(schedule => schedule.day === dayOfWeek)
    
    if (!daySchedule || !daySchedule.breaks || !Array.isArray(daySchedule.breaks)) {
      return false
    }
    
    // Parse the time slot
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    const slotStartMinutes = slotHour * 60 + slotMinute
    
    // Get appointment duration to calculate slot end time
    const appointmentDuration = dentistData?.appointmentDuration || 30
    const slotEndMinutes = slotStartMinutes + appointmentDuration
    
    // Check if slot overlaps with any break period
    // Using the same logic as appointmentSlots.js utility
    return daySchedule.breaks.some(breakPeriod => {
      if (!breakPeriod.start || !breakPeriod.end) return false
      
      const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number)
      const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number)
      
      const breakStartMinutes = breakStartHour * 60 + breakStartMinute
      const breakEndMinutes = breakEndHour * 60 + breakEndMinute
      
      // Slot is during/overlapping break if it starts during break OR ends during break OR encompasses break
      // This matches the logic: slotStart >= breakStart && slotStart < breakEnd
      return slotStartMinutes >= breakStartMinutes && slotStartMinutes < breakEndMinutes
    })
  }

  // Check if a time slot is outside working hours for a specific day
  const isOutsideWorkingHours = (date, timeSlot) => {
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours)) {
      return false
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = dayNames[date.getDay()]
    
    // Find the schedule for this day
    const daySchedule = dentistData.workingHours.find(schedule => schedule.day === dayOfWeek)
    
    // If day is not working or no schedule found, it's outside working hours
    if (!daySchedule || daySchedule.isWorking === false || !daySchedule.start || !daySchedule.end) {
      return true
    }
    
    // Parse the time slot
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    const slotStartMinutes = slotHour * 60 + slotMinute
    
    // Get appointment duration to calculate slot end time
    const appointmentDuration = dentistData?.appointmentDuration || 30
    const slotEndMinutes = slotStartMinutes + appointmentDuration
    
    // Parse working hours
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number)
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number)
    
    const workStartMinutes = startHour * 60 + startMinute
    const workEndMinutes = endHour * 60 + endMinute
    
    // Slot is outside working hours if:
    // 1. It starts before work starts
    // 2. It starts at or after work ends
    // 3. It would end after work ends (appointment would run past closing time)
    return slotStartMinutes < workStartMinutes || 
           slotStartMinutes >= workEndMinutes || 
           slotEndMinutes > workEndMinutes
  }

  // Get the break label and time range for a specific time slot
  const getBreakInfo = (date, timeSlot) => {
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours)) {
      return { label: 'Break', timeRange: null }
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = dayNames[date.getDay()]
    
    // Find the schedule for this day
    const daySchedule = dentistData.workingHours.find(schedule => schedule.day === dayOfWeek)
    
    if (!daySchedule || !daySchedule.breaks || !Array.isArray(daySchedule.breaks)) {
      return { label: 'Break', timeRange: null }
    }
    
    // Parse the time slot
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    const slotStartMinutes = slotHour * 60 + slotMinute
    
    // Find the matching break period
    const matchingBreak = daySchedule.breaks.find(breakPeriod => {
      if (!breakPeriod.start || !breakPeriod.end) return false
      
      const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number)
      const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number)
      
      const breakStartMinutes = breakStartHour * 60 + breakStartMinute
      const breakEndMinutes = breakEndHour * 60 + breakEndMinute
      
      return slotStartMinutes >= breakStartMinutes && slotStartMinutes < breakEndMinutes
    })
    
    if (matchingBreak) {
      return {
        label: matchingBreak.label || 'Break',
        timeRange: `${convertTo12Hour(matchingBreak.start)} - ${convertTo12Hour(matchingBreak.end)}`
      }
    }
    
    return { label: 'Break', timeRange: null }
  }

  // Get appointments for a specific time slot (shows appointments that START at this exact slot)
  const getAppointmentsForSlot = (date, timeSlot) => {
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0) // Reset time for consistent comparison
    const dateStr = dateObj.toDateString()
    const dayAppointments = appointmentsByDate[dateStr] || []
    
    // Parse the time slot
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    
    const matchedApts = dayAppointments.filter(apt => {
      if (!apt.startTime) return false
      
      const startTime = new Date(apt.startTime)
      const aptHour = startTime.getHours()
      const aptMinute = startTime.getMinutes()
      
      // Show appointment ONLY in the exact slot where it starts
      return aptHour === slotHour && aptMinute === slotMinute
    })
    
    return matchedApts
  }

  // Calculate appointment height based on duration (60px per slot, dynamic slot size)
  const getAppointmentHeight = (apt) => {
    const slotDuration = dentistData?.appointmentDuration || 30
    
    if (!apt.endTime || !apt.startTime) {
      // If no end time, use default appointment duration
      const duration = dentistData?.appointmentDuration || 30
      return (duration / slotDuration) * 60 // 60px per slot
    }
    
    const start = new Date(apt.startTime)
    const end = new Date(apt.endTime)
    const duration = (end - start) / (1000 * 60) // minutes
    
    // Ensure minimum height of one slot even for very short appointments
    const actualDuration = Math.max(duration, slotDuration)
    
    const slots = actualDuration / slotDuration // each slot is based on appointment duration
    return Math.ceil(slots) * 60 // 60px per slot, rounded up to nearest slot
  }

  // Navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const isToday = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate.getTime() === today.getTime()
  }

  const isPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate.getTime() < today.getTime()
  }

  // Check if a specific time slot has passed
  const isPastTimeSlot = (date, timeSlot) => {
    const now = new Date()
    const slotDate = new Date(date)
    
    // Parse the time slot
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    slotDate.setHours(slotHour, slotMinute, 0, 0)
    
    // Return true if the slot time has passed
    return slotDate.getTime() < now.getTime()
  }

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase()
    
    if (statusUpper === 'CONFIRMED') {
      return isDarkMode
        ? 'bg-green-500/20 border-green-500 text-green-300'
        : 'bg-green-100 border-green-500 text-green-800'
    } else if (statusUpper === 'PENDING') {
      return isDarkMode
        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
        : 'bg-yellow-100 border-yellow-500 text-yellow-800'
    } else if (statusUpper === 'COMPLETED') {
      return isDarkMode
        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
        : 'bg-blue-100 border-blue-500 text-blue-800'
    } else if (statusUpper === 'CANCELLED') {
      return isDarkMode
        ? 'bg-red-500/20 border-red-500 text-red-300'
        : 'bg-red-100 border-red-500 text-red-800'
    } else {
      return isDarkMode
        ? 'bg-gray-500/20 border-gray-500 text-gray-300'
        : 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {/* Working Hours Summary */}
        {hasWorkingHours && dentistData?.appointmentDuration && (
          <div className={`mb-3 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-750' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaClock className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Slot Duration: <span className="text-teal-600">{dentistData.appointmentDuration}min</span>
                  </span>
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click on available slots to schedule appointments
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
            >
              <FaChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
            >
              <FaChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className={`text-sm font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {weekDates.length > 0 && (
              <>
                {weekDates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[weekDates.length - 1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        {!hasWorkingHours ? (
          // No Working Hours Set - Display Message
          <div className={`p-12 text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FaClock className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              No Working Hours Set
            </h3>
            <p className={`text-sm mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Please configure your working hours to view and manage your schedule.
            </p>
            <Button
              variant="primary"
              onClick={() => onNavigateToSchedule?.('settings:schedule')}
              className="inline-flex items-center gap-2"
            >
              <FaClock className="w-4 h-4" />
              Set Working Hours
            </Button>
          </div>
        ) : (
          <div className="min-w-225">
            {/* Day Headers */}
            <div 
              className={`grid border-b sticky top-0 z-10 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
              style={{ gridTemplateColumns: `120px repeat(${weekDates.length}, 1fr)` }}
            >
              <div className={`p-3 text-center text-xs font-semibold ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Time
              </div>
              {weekDates.map((date, index) => {
                const dateObj = new Date(date)
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                const dayOfWeek = dayNames[dateObj.getDay()]
                const daySchedule = dentistData?.workingHours?.find(schedule => schedule.day === dayOfWeek)
                const isDatePast = isPast(dateObj)
                
                return (
                  <div
                    key={index}
                    className={`p-3 text-center ${
                      isToday(dateObj)
                        ? isDarkMode ? 'bg-teal-500/20' : 'bg-teal-50'
                        : isDatePast
                          ? isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'
                          : ''
                    }`}
                  >
                    <div className={`text-xs font-semibold ${
                      isDatePast
                        ? isDarkMode ? 'text-gray-600' : 'text-gray-500'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${
                      isToday(dateObj)
                        ? 'text-teal-600'
                        : isDatePast
                          ? isDarkMode ? 'text-gray-600' : 'text-gray-500'
                          : isDarkMode
                            ? 'text-white'
                            : 'text-gray-800'
                    }`}>
                      {dateObj.getDate()}
                    </div>
                    {daySchedule && daySchedule.start && daySchedule.end && (
                      <div className={`text-[10px] mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {convertTo12Hour(daySchedule.start)} - {convertTo12Hour(daySchedule.end)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          {/* Time Grid */}
          <div className="relative">
            {/* Current Time Indicator - shown across all day columns */}
            {(() => {
              const now = new Date()
              const currentHour = now.getHours()
              const currentMinute = now.getMinutes()
              const currentTimeInMinutes = currentHour * 60 + currentMinute
              
              // Find if current time falls within the displayed time slots
              const appointmentDuration = dentistData?.appointmentDuration || 30
              
              // Find the earliest and latest time in the grid
              if (timeSlots.length > 0) {
                const [firstSlotHour, firstSlotMin] = timeSlots[0].split(':').map(Number)
                const firstSlotMinutes = firstSlotHour * 60 + firstSlotMin
                
                const lastSlot = timeSlots[timeSlots.length - 1]
                const [lastSlotHour, lastSlotMin] = lastSlot.split(':').map(Number)
                const lastSlotMinutes = lastSlotHour * 60 + lastSlotMin + appointmentDuration
                
                // Check if current time is within the calendar range
                if (currentTimeInMinutes >= firstSlotMinutes && currentTimeInMinutes <= lastSlotMinutes) {
                  // Calculate position from top
                  const minutesFromStart = currentTimeInMinutes - firstSlotMinutes
                  const totalGridMinutes = lastSlotMinutes - firstSlotMinutes
                  const slotHeight = 60 // px per slot
                  const totalHeight = (totalGridMinutes / appointmentDuration) * slotHeight
                  const topPosition = (minutesFromStart / totalGridMinutes) * totalHeight
                  
                  return (
                    <div 
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${topPosition}px` }}
                    >
                      <div className="flex items-center">
                        {/* Time label */}
                        <div className={`w-30 flex items-center justify-center ${
                          isDarkMode ? 'bg-red-600' : 'bg-red-500'
                        } text-white text-[10px] font-bold py-0.5 rounded-r`}>
                          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                        {/* Line across calendar */}
                        <div className={`flex-1 h-0.5 ${
                          isDarkMode ? 'bg-red-600' : 'bg-red-500'
                        }`} />
                      </div>
                      {/* Red dot at the start */}
                      <div className={`absolute left-30 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                        isDarkMode ? 'bg-red-600' : 'bg-red-500'
                      }`} />
                    </div>
                  )
                }
              }
              return null
            })()}
            
            {timeSlots.map((time, timeIndex) => (
              <div
                key={time}
                className={`grid border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-300'
                }`}
                style={{ minHeight: '60px', gridTemplateColumns: `120px repeat(${weekDates.length}, 1fr)` }}
              >
                {/* Time Label */}
                <div className={`p-2 text-xs font-medium text-center border-r ${
                  isDarkMode 
                    ? 'text-gray-400 border-gray-700' 
                    : 'text-gray-700 border-gray-300 bg-gray-50'
                }`}>
                  {convertTo12Hour(time)}
                </div>

                {/* Day Cells */}
                {weekDates.map((date, dateIndex) => {
                  const dateObj = new Date(date)
                  const appointments = getAppointmentsForSlot(dateObj, time)
                  const isBreak = isBreakTime(dateObj, time)
                  const isOutside = isOutsideWorkingHours(dateObj, time)
                  const breakInfo = isBreak ? getBreakInfo(dateObj, time) : null
                  const isPastSlot = isPastTimeSlot(dateObj, time)
                  const isAvailable = !isBreak && !isOutside && !isPastSlot && appointments.length === 0
                  const isDatePast = isPast(dateObj)
                  
                  return (
                    <div
                      key={dateIndex}
                      className={`relative p-1 border-r ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-300'
                      } ${
                        isOutside
                          ? (isDarkMode ? 'bg-gray-900/50' : 'bg-gray-200/50')
                          : isBreak
                            ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-100')
                            : isToday(dateObj)
                              ? isPastSlot
                                ? (isDarkMode ? 'bg-teal-500/5' : 'bg-teal-50/30')
                                : (isDarkMode ? 'bg-teal-500/10' : 'bg-teal-50/50')
                              : isPastSlot
                                ? (isDarkMode ? 'bg-gray-900/30' : 'bg-gray-100/70')
                                : isDatePast
                                  ? (isDarkMode ? 'bg-gray-900/30' : 'bg-gray-100/70')
                                  : isAvailable
                                    ? (isDarkMode ? 'hover:bg-teal-500/5 cursor-pointer' : 'hover:bg-teal-50 cursor-pointer')
                                    : ''
                      } ${
                        isOutside || isPastSlot ? 'cursor-not-allowed' : ''
                      } ${
                        isToday(dateObj) && isAvailable ? (isDarkMode ? 'hover:bg-teal-500/15' : 'hover:bg-teal-100') : ''
                      } transition-colors duration-150`}
                      onClick={() => {
                        if (!isBreak && !isOutside && !isPastSlot && isAvailable) {
                          // Navigate to treatments page for empty available slots
                          if (onNavigateToSchedule) {
                            onNavigateToSchedule('treatments')
                          }
                        }
                      }}
                      title={
                        isOutside 
                          ? 'Outside working hours'
                          : isPastSlot
                            ? 'Time slot has passed'
                            : isBreak 
                              ? `${breakInfo?.label} (${breakInfo?.timeRange})`
                              : isAvailable
                                ? 'Click to add treatment'
                                : ''
                      }
                    >
                      {/* Past time slot indicator */}
                      {isPastSlot && !isOutside && !isBreak && (
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                          <div className={`text-center ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            <div className="text-[10px] font-medium">Past</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Outside working hours overlay */}
                      {isOutside && (
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                          <div className={`text-center ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            <div className="text-[10px] font-medium">Closed</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Break time overlay */}
                      {isBreak && !isOutside && breakInfo && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-1`}>
                          <div className={`text-center ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`}>
                            <div className="text-[10px] font-semibold">{breakInfo.label}</div>
                            {breakInfo.timeRange && (
                              <div className="text-[9px] mt-0.5 opacity-90">{breakInfo.timeRange}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Available slot indicator */}
                      {isAvailable && !isBreak && !isOutside && (
                        <div className={`absolute top-1 right-1 pointer-events-none`}>
                          <FaPlus className={`w-2 h-2 ${
                            isDarkMode ? 'text-teal-500/50' : 'text-teal-600/50'
                          }`} />
                        </div>
                      )}
                      
                      {/* Appointments */}
                      {appointments.map((apt, aptIndex) => (
                        <div
                          key={apt.id || aptIndex}
                          className={`
                            absolute left-1 right-1 rounded-md border-l-[3px] p-1.5 cursor-pointer
                            transition-all hover:shadow-md hover:z-10 overflow-hidden
                            ${getStatusColor(apt.status)}
                          `}
                          style={{
                            height: `${getAppointmentHeight(apt) - 4}px`,
                            minHeight: '52px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Navigate to appointments page when clicking on an appointment
                            if (onNavigateToSchedule) {
                              onNavigateToSchedule('appointments')
                            }
                          }}
                        >
                          {/* Patient Name */}
                          <div className="text-[11px] font-semibold truncate leading-tight">
                            {apt.patient?.name || `${apt.patient?.firstName} ${apt.patient?.lastName}`}
                          </div>
                          
                          {/* Treatment */}
                          <div className="text-[10px] opacity-75 truncate leading-tight mt-0.5">
                            {apt.treatment?.treatmentName || 'Consultation'}
                          </div>
                          
                          {/* Time Range */}
                          <div className="flex items-center gap-0.5 text-[9px] opacity-70 mt-1 leading-tight">
                            <FaClock className="w-2 h-2 shrink-0" />
                            <span className="truncate font-medium">
                              {new Date(apt.startTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true
                              })}
                              {apt.endTime && (
                                <>
                                  {' - '}
                                  {new Date(apt.endTime).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Legend */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col gap-3">
          {/* Appointment Status */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`text-xs font-semibold ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Appointment Status:</span>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirmed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Completed
                </span>
              </div>
            </div>
          </div>
          
          {/* Time Slot Types */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`text-xs font-semibold ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Time Slots:</span>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-teal-50 border border-teal-200'}`}></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Available (Click to add treatment)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Break Time
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-200/50'}`}></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Outside Working Hours
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentSchedule
