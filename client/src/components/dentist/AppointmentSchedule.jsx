import { useState, useEffect, useMemo } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUser, FaClock, FaPlus } from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from '../index'

const AppointmentSchedule = ({ appointments = [], onAddAppointment, onAppointmentClick }) => {
  const { isDarkMode } = useTheme()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // week or day

  // Get week dates (Mon-Sat for dental practice)
  const getWeekDates = (date) => {
    const current = new Date(date)
    const first = current.getDate() - current.getDay() + 1 // Monday
    const weekDates = []
    
    for (let i = 0; i < 6; i++) { // Mon-Sat (6 days)
      const day = new Date(current.setDate(first + i))
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

  // Time slots (8 AM - 8 PM)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 20) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }, [])

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {}
    appointments.forEach(apt => {
      const date = new Date(apt.appointmentDate).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(apt)
    })
    return grouped
  }, [appointments])

  // Get appointments for a specific time slot
  const getAppointmentsForSlot = (date, timeSlot) => {
    const dateStr = date.toDateString()
    const dayAppointments = appointmentsByDate[dateStr] || []
    
    return dayAppointments.filter(apt => {
      const startTime = new Date(apt.startTime)
      const hours = startTime.getHours()
      const minutes = startTime.getMinutes()
      const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      return slotTime === timeSlot
    })
  }

  // Calculate appointment height based on duration
  const getAppointmentHeight = (apt) => {
    const start = new Date(apt.startTime)
    const end = new Date(apt.endTime)
    const duration = (end - start) / (1000 * 60) // minutes
    const slots = duration / 30 // each slot is 30 min
    return slots * 60 // 60px per slot
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
    return date.toDateString() === today.toDateString()
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
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className={`grid grid-cols-7 border-b sticky top-0 z-10 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`p-3 text-center text-xs font-semibold ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Time
            </div>
            {weekDates.map((date, index) => (
              <div
                key={index}
                className={`p-3 text-center ${
                  isToday(date)
                    ? 'bg-teal-500/10'
                    : ''
                }`}
              >
                <div className={`text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold mt-1 ${
                  isToday(date)
                    ? 'text-teal-600'
                    : isDarkMode
                      ? 'text-white'
                      : 'text-gray-800'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
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
                  const appointments = getAppointmentsForSlot(date, time)
                  
                  return (
                    <div
                      key={dateIndex}
                      className={`relative p-1 border-r ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      } ${
                        isToday(date) ? 'bg-teal-500/5' : ''
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
                              minute: '2-digit' 
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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Cancelled
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentSchedule
