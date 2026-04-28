import { useEffect, useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { LoadingSpinner } from '../../common'
import { convertTo12Hour } from '../../../utils/helpers'
import { fetchAvailableSlotsData } from '../../../utils/appointmentSlots'

/**
 * AppointmentSlotPicker Component
 * Unified time slot selection component for appointments
 * Eliminates duplication between BookAppointmentModal and NewAppointmentModal
 * 
 * @param {Function} apiCall - API function to fetch slots (e.g., appointmentsAPI.getAvailableSlots)
 * @param {string|number} dentistId - Dentist ID
 * @param {string} selectedDate - Selected date string
 * @param {string} selectedTime - Selected time slot
 * @param {Function} onTimeSelect - Callback when time slot is selected
 * @param {string} className - Additional CSS classes
 */
const AppointmentSlotPicker = ({ 
  apiCall,
  dentistId, 
  selectedDate, 
  selectedTime, 
  onTimeSelect,
  className = ''
}) => {
  const { isDarkMode } = useTheme()
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [appointmentDuration, setAppointmentDuration] = useState(30)

  // Fetch available slots when date and dentist are selected
  useEffect(() => {
    if (dentistId && selectedDate) {
      fetchSlots()
    } else {
      setAvailableSlots([])
      setBookedSlots([])
    }
  }, [dentistId, selectedDate])

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true)
      const result = await fetchAvailableSlotsData(apiCall, dentistId, selectedDate)
      
      setAvailableSlots(result.slots)
      setBookedSlots(result.bookedSlots)
      setAppointmentDuration(result.appointmentDuration)
    } catch (err) {
      console.error('Error fetching available slots:', err)
      setAvailableSlots([])
      setBookedSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const isSlotBooked = (slot) => bookedSlots.includes(slot)
  const isSlotSelected = (slot) => selectedTime === slot

  if (loadingSlots) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!selectedDate) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Please select a date first
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No available time slots for this date
      </div>
    )
  }

  // Group slots by period (Morning, Afternoon, Evening)
  const groupSlotsByPeriod = () => {
    const morning = []
    const afternoon = []
    const evening = []

    availableSlots.forEach(slot => {
      const [hour] = slot.split(':').map(Number)
      if (hour < 12) {
        morning.push(slot)
      } else if (hour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    return { morning, afternoon, evening }
  }

  const { morning, afternoon, evening } = groupSlotsByPeriod()

  const renderSlotGroup = (title, slots) => {
    if (slots.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {title}
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {slots.map((slot) => {
            const booked = isSlotBooked(slot)
            const selected = isSlotSelected(slot)
            
            return (
              <button
                key={slot}
                type="button"
                onClick={() => !booked && onTimeSelect(slot)}
                disabled={booked}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${selected
                    ? 'bg-teal-600 text-white ring-2 ring-teal-500 ring-offset-2'
                    : booked
                    ? `cursor-not-allowed ${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`
                    : `${isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`
                  }
                `}
              >
                {convertTo12Hour(slot)}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Available Time Slots
        </h3>
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Duration: {appointmentDuration} minutes
        </span>
      </div>

      {renderSlotGroup('Morning (Before 12 PM)', morning)}
      {renderSlotGroup('Afternoon (12 PM - 5 PM)', afternoon)}
      {renderSlotGroup('Evening (After 5 PM)', evening)}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-600 rounded"></div>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Booked</span>
        </div>
      </div>
    </div>
  )
}

export default AppointmentSlotPicker
