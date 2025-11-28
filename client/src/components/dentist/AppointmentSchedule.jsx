import { useState, useEffect, useMemo } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUser, FaClock, FaPlus } from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from '../index'

const AppointmentSchedule = ({ appointments = [], onAddAppointment, onAppointmentClick, dentistData = null }) => {
  const { isDarkMode } = useTheme()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // week or day
  
  // Filter out pending and cancelled appointments
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => 
      apt.status !== 'PENDING' && apt.status !== 'CANCELLED'
    )
    
    // Debug: Log appointment data to help troubleshoot
    console.log('📅 Total appointments received:', appointments.length)
    console.log('📅 Filtered appointments (non-pending/cancelled):', filtered.length)
    if (filtered.length > 0) {
      console.log('📅 Sample appointment:', {
        id: filtered[0].id,
        patient: filtered[0].patient?.firstName || filtered[0].patient?.name,
        startTime: filtered[0].startTime,
        startTimeFormatted: new Date(filtered[0].startTime).toLocaleString(),
        status: filtered[0].status
      })
    }
    
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
    console.log('📅 Week dates:', dates.map(d => d.toDateString()))
    return dates
  }, [currentWeek, getWorkingDaysMap])

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

  // Generate time slots based on dentist working hours and appointment duration
  const timeSlots = useMemo(() => {
    // Get appointment duration in minutes (default 30)
    const appointmentDuration = dentistData?.appointmentDuration || 30
    
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours) || dentistData.workingHours.length === 0) {
      // Default: 8 AM - 8 PM
      const slots = []
      const startHour = 8
      const endHour = 20
      const totalMinutes = (endHour - startHour) * 60
      
      for (let minute = 0; minute < totalMinutes; minute += appointmentDuration) {
        const hour = Math.floor(minute / 60) + startHour
        const min = minute % 60
        if (hour <= endHour) {
          slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
        }
      }
      return slots
    }

    // Find earliest start and latest end from working hours
    let earliestHour = 24
    let latestHour = 0
    
    dentistData.workingHours.forEach(schedule => {
      if (schedule.start) {
        const startHour = parseInt(schedule.start.split(':')[0])
        earliestHour = Math.min(earliestHour, startHour)
      }
      if (schedule.end) {
        const endHour = parseInt(schedule.end.split(':')[0])
        latestHour = Math.max(latestHour, endHour)
      }
    })

    // Default to 8-20 if no valid hours found
    if (earliestHour === 24 || latestHour === 0) {
      earliestHour = 8
      latestHour = 20
    }

    // Generate slots based on appointment duration
    const slots = []
    const totalMinutes = (latestHour - earliestHour) * 60
    
    for (let minute = 0; minute < totalMinutes; minute += appointmentDuration) {
      const hour = Math.floor(minute / 60) + earliestHour
      const min = minute % 60
      if (hour <= latestHour) {
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
    return slots
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
    
    console.log('📅 Grouped appointments by date:', grouped)
    return grouped
  }, [filteredAppointments])

  // Get appointments for a specific time slot (shows appointments that START in or near this slot)
  const getAppointmentsForSlot = (date, timeSlot) => {
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0) // Reset time for consistent comparison
    const dateStr = dateObj.toDateString()
    const dayAppointments = appointmentsByDate[dateStr] || []
    
    // Get appointment duration for slot calculation
    const appointmentDuration = dentistData?.appointmentDuration || 30
    
    // Parse the time slot
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    const slotStartMinutes = slotHour * 60 + slotMinute
    const slotEndMinutes = slotStartMinutes + appointmentDuration
    
    const matchedApts = dayAppointments.filter(apt => {
      if (!apt.startTime) return false
      
      const startTime = new Date(apt.startTime)
      const hours = startTime.getHours()
      const minutes = startTime.getMinutes()
      const aptStartMinutes = hours * 60 + minutes
      
      // Show appointment if it starts within this time slot
      return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotEndMinutes
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

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
      case 'PENDING':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300'
      case 'COMPLETED':
        return 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300'
      case 'CANCELLED':
        return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-700 dark:text-gray-300'
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
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div 
            className={`grid border-b sticky top-0 z-10 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
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
              return (
                <div
                  key={index}
                  className={`p-3 text-center ${
                    isToday(dateObj)
                      ? 'bg-teal-500/10'
                      : ''
                  }`}
                >
                  <div className={`text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold mt-1 ${
                    isToday(dateObj)
                      ? 'text-teal-600'
                      : isDarkMode
                        ? 'text-white'
                        : 'text-gray-800'
                  }`}>
                    {dateObj.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {timeSlots.map((time, timeIndex) => (
              <div
                key={time}
                className={`grid border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
                style={{ minHeight: '60px', gridTemplateColumns: `120px repeat(${weekDates.length}, 1fr)` }}
              >
                {/* Time Label */}
                <div className={`p-2 text-xs font-medium text-center border-r ${
                  isDarkMode 
                    ? 'text-gray-400 border-gray-700' 
                    : 'text-gray-600 border-gray-200'
                }`}>
                  {convertTo12Hour(time)}
                </div>

                {/* Day Cells */}
                {weekDates.map((date, dateIndex) => {
                  const dateObj = new Date(date)
                  const appointments = getAppointmentsForSlot(dateObj, time)
                  
                  return (
                    <div
                      key={dateIndex}
                      className={`relative p-1 border-r ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      } ${
                        isToday(dateObj) ? 'bg-teal-500/5' : ''
                      }`}
                    >
                      {appointments.map((apt, aptIndex) => (
                        <div
                          key={apt.id || aptIndex}
                          className={`
                            absolute left-1 right-1 rounded-lg border-l-4 p-2 cursor-pointer
                            transition-all hover:shadow-lg hover:z-10
                            ${getStatusColor(apt.status)}
                          `}
                          style={{
                            height: `${getAppointmentHeight(apt) - 4}px`,
                            maxHeight: '120px'
                          }}
                          onClick={() => onAppointmentClick?.(apt)}
                        >
                          <div className="text-xs font-semibold truncate">
                            {apt.patient?.name || `${apt.patient?.firstName} ${apt.patient?.lastName}`}
                          </div>
                          <div className="text-xs opacity-80 truncate mt-0.5">
                            {apt.treatment?.treatmentType || 'Consultation'}
                          </div>
                          <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                            <FaClock className="w-2.5 h-2.5" />
                            {new Date(apt.startTime).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true
                            })}
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
      </div>

      {/* Legend */}
      <div className={`p-4 border-t flex items-center gap-6 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <span className={`text-xs font-medium ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Status:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirmed
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
    </div>
  )
}

export default AppointmentSchedule
