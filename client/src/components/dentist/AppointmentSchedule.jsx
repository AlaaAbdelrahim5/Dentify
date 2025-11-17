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
    if (filtered.length > 0) {
      console.log('📅 Appointments for calendar:', filtered.map(apt => ({
        id: apt.id,
        patient: apt.patient?.firstName || apt.patient?.name,
        date: new Date(apt.appointmentDate).toLocaleDateString(),
        startTime: new Date(apt.startTime).toLocaleTimeString(),
        endTime: apt.endTime ? new Date(apt.endTime).toLocaleTimeString() : 'No end time',
        status: apt.status
      })))
    }
    
    return filtered
  }, [appointments])

  // Get week dates (Mon-Sat for dental practice)
  const getWeekDates = (date) => {
    const current = new Date(date)
    current.setHours(0, 0, 0, 0) // Reset time to start of day
    
    const currentDay = current.getDay()
    const diff = currentDay === 0 ? -6 : 1 - currentDay // Calculate days to Monday
    
    const monday = new Date(current)
    monday.setDate(current.getDate() + diff)
    
    const weekDates = []
    for (let i = 0; i < 6; i++) { // Mon-Sat (6 days)
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      weekDates.push(day)
    }
    
    return weekDates
  }

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek])

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

  // Generate time slots based on dentist working hours
  const timeSlots = useMemo(() => {
    if (!dentistData?.workingHours || !Array.isArray(dentistData.workingHours) || dentistData.workingHours.length === 0) {
      // Default: 8 AM - 8 PM
      const slots = []
      for (let hour = 8; hour <= 20; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        if (hour < 20) {
          slots.push(`${hour.toString().padStart(2, '0')}:30`)
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

    // Generate slots for working hours range
    const slots = []
    for (let hour = earliestHour; hour <= latestHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < latestHour) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }, [dentistData])

  // Group filtered appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {}
    filteredAppointments.forEach(apt => {
      const aptDate = new Date(apt.appointmentDate)
      aptDate.setHours(0, 0, 0, 0) // Reset time for consistent comparison
      const dateKey = aptDate.toDateString()
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(apt)
    })
    return grouped
  }, [filteredAppointments])

  // Get appointments for a specific time slot (shows appointments that START in or near this slot)
  const getAppointmentsForSlot = (date, timeSlot) => {
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0) // Reset time for consistent comparison
    const dateStr = dateObj.toDateString()
    const dayAppointments = appointmentsByDate[dateStr] || []
    
    return dayAppointments.filter(apt => {
      if (!apt.startTime) return false
      
      const startTime = new Date(apt.startTime)
      const hours = startTime.getHours()
      const minutes = startTime.getMinutes()
      
      // Parse the time slot
      const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
      
      // Calculate slot boundaries (30-minute slots)
      // An appointment shows in the slot where it starts
      // Round down to nearest 30-minute slot
      const aptSlotMinute = minutes >= 30 ? 30 : 0
      
      return hours === slotHour && aptSlotMinute === slotMinute
    })
  }

  // Calculate appointment height based on duration (minimum 1 slot = 60px)
  const getAppointmentHeight = (apt) => {
    if (!apt.endTime || !apt.startTime) {
      // If no end time, use default appointment duration or 30 minutes
      const duration = dentistData?.appointmentDuration || 30
      return (duration / 30) * 60 // 60px per 30-minute slot
    }
    
    const start = new Date(apt.startTime)
    const end = new Date(apt.endTime)
    const duration = (end - start) / (1000 * 60) // minutes
    
    // Ensure minimum height of one slot even for very short appointments
    const minDuration = 30
    const actualDuration = Math.max(duration, minDuration)
    
    const slots = actualDuration / 30 // each slot is 30 min
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className={`w-5 h-5 ${
              isDarkMode ? 'text-teal-400' : 'text-teal-600'
            }`} />
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Weekly Schedule
            </h3>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={onAddAppointment}
            className="bg-gradient-to-r from-teal-600 to-cyan-600"
          >
            <FaPlus className="w-3 h-3 mr-2" />
            New Appointment
          </Button>
        </div>

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
            {weekDates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[5]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div className={`grid grid-cols-7 border-b sticky top-0 z-10 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
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
                className={`grid grid-cols-7 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
                style={{ minHeight: '60px' }}
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
