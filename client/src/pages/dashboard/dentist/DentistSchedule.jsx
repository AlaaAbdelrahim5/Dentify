import { useState, useEffect } from 'react'
import { 
  FaClock,
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCheck
} from 'react-icons/fa'
import { Card, Button, Input, Toast } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'

const DentistSchedule = () => {
  const { isDarkMode } = useTheme()
  const [editingDay, setEditingDay] = useState(null)
  const [isAddingBreak, setIsAddingBreak] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  
  // Fetch dentist profile on mount
  useEffect(() => {
    fetchDentistProfile()
  }, [])

  const fetchDentistProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dentistsAPI.getMyProfile()
      console.log('Dentist profile response:', response)
      
      // Handle different response structures
      const dentist = response.data?.dentist || response.dentist || response.data
      
      if (!dentist) {
        throw new Error('Dentist profile not found in response')
      }
      
      // Load working hours from database
      if (dentist.workingHours && Array.isArray(dentist.workingHours)) {
        const scheduleMap = {}
        
        dentist.workingHours.forEach(daySchedule => {
          scheduleMap[daySchedule.day] = {
            isWorking: daySchedule.isWorking !== false,
            startTime: daySchedule.start || '09:00',
            endTime: daySchedule.end || '17:00',
            breaks: Array.isArray(daySchedule.breaks) ? daySchedule.breaks : []
          }
        })
        
        // Fill in missing days with defaults
        daysOfWeek.forEach(day => {
          if (!scheduleMap[day]) {
            scheduleMap[day] = {
              isWorking: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
              startTime: '09:00',
              endTime: '17:00',
              breaks: []
            }
          }
        })
        
        setSchedule(scheduleMap)
      } else {
        // Initialize with default schedule if no data exists
        const defaultSchedule = {}
        daysOfWeek.forEach(day => {
          defaultSchedule[day] = {
            isWorking: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
            startTime: '09:00',
            endTime: '17:00',
            breaks: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(day) 
              ? [{ start: '12:00', end: '13:00', label: 'Lunch Break' }] 
              : []
          }
        })
        setSchedule(defaultSchedule)
      }
      
      // Load appointment duration
      if (dentist.appointmentDuration) {
        setDefaultDuration(dentist.appointmentDuration)
      }
    } catch (err) {
      console.error('Error fetching dentist profile:', err)
      setError('Failed to load schedule. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Mock schedule data (will be replaced with fetched data)
  const [schedule, setSchedule] = useState({
    Sunday: { 
      
      isWorking: false, 
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [] 
    },
    Monday: { 
      isWorking: true, 
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [{ start: '12:00', end: '13:00', label: 'Lunch Break' }] 
    },
    Tuesday: { 
      isWorking: true, 
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [{ start: '12:00', end: '13:00', label: 'Lunch Break' }] 
    },
    Wednesday: { 
      isWorking: true, 
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [{ start: '12:00', end: '13:00', label: 'Lunch Break' }] 
    },
    Thursday: { 
      isWorking: true, 
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [{ start: '12:00', end: '13:00', label: 'Lunch Break' }] 
    },
    Friday: { 
      isWorking: true, 
      startTime: '09:00', 
      endTime: '15:00', 
      breaks: [] 
    },
    Saturday: { 
      isWorking: false, 
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [] 
    }
  })

  const [defaultDuration, setDefaultDuration] = useState(30)

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleDayToggle = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorking: !prev[day].isWorking
      }
    }))
  }

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const addBreak = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...prev[day].breaks, { start: '12:00', end: '13:00', label: 'Break' }]
      }
    }))
  }

  const removeBreak = (day, index) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.filter((_, i) => i !== index)
      }
    }))
  }

  const updateBreak = (day, index, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.map((breakItem, i) => 
          i === index ? { ...breakItem, [field]: value } : breakItem
        )
      }
    }))
  }

  const getTotalWorkingHours = () => {
    let totalMinutes = 0
    
    daysOfWeek.forEach(day => {
      const daySchedule = schedule[day]
      if (daySchedule.isWorking) {
        const start = new Date(`2024-01-01 ${daySchedule.startTime}:00`)
        const end = new Date(`2024-01-01 ${daySchedule.endTime}:00`)
        let dayMinutes = (end - start) / (1000 * 60)
        
        // Subtract break times
        daySchedule.breaks.forEach(breakItem => {
          const breakStart = new Date(`2024-01-01 ${breakItem.start}:00`)
          const breakEnd = new Date(`2024-01-01 ${breakItem.end}:00`)
          dayMinutes -= (breakEnd - breakStart) / (1000 * 60)
        })
        
        totalMinutes += dayMinutes
      }
    })
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const getWorkingDays = () => {
    return daysOfWeek.filter(day => schedule[day].isWorking).length
  }

  const handleSaveSchedule = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Convert schedule to JSON array format for database
      const workingHours = daysOfWeek.map(day => ({
        day,
        isWorking: schedule[day].isWorking,
        start: schedule[day].startTime,
        end: schedule[day].endTime,
        breaks: schedule[day].breaks || []
      }))
      
      // Update dentist profile with working hours and appointment duration
      await dentistsAPI.updateMyProfile({
        workingHours: workingHours,
        appointmentDuration: defaultDuration
      })
      
      setToast({ message: 'Schedule saved successfully!', type: 'success' })
    } catch (error) {
      console.error('Error saving schedule:', error)
      setError('Failed to save schedule. Please try again.')
      setToast({ message: 'Failed to save schedule. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-800 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p>{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Schedule Management
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage your working hours and availability
          </p>
        </div>
        <Button variant="primary" onClick={handleSaveSchedule} disabled={saving}>
          <FaSave className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Schedule'}
        </Button>
      </div>

      {/* Schedule Overview */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Working Days</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{getWorkingDays()}</p>
            </div>
            <FaCalendarAlt className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Weekly Hours</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{getTotalWorkingHours()}</p>
            </div>
            <FaClock className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Appointment Duration</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{defaultDuration}min</p>
            </div>
            <FaClock className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Weekly Schedule
        </h2>

        <div className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day} className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={schedule[day].isWorking}
                      onChange={() => handleDayToggle(day)}
                      className="w-5 h-5 text-teal-600 rounded"
                    />
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {day}
                    </span>
                  </label>
                  {schedule[day].isWorking && (
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {formatTime(schedule[day].startTime)} - {formatTime(schedule[day].endTime)}
                    </span>
                  )}
                </div>
                {schedule[day].isWorking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDay(editingDay === day ? null : day)}
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {schedule[day].isWorking && editingDay === day && (
                <div className="space-y-4 mt-4 p-4 border-t border-gray-300 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={schedule[day].startTime}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={schedule[day].endTime}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Breaks Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Breaks
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBreak(day)}
                      >
                        <FaPlus className="w-4 h-4 mr-2" />
                        Add Break
                      </Button>
                    </div>

                    {schedule[day].breaks.length > 0 && (
                      <div className="space-y-3">
                        {schedule[day].breaks.map((breakItem, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                          }`}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Label
                                </label>
                                <input
                                  type="text"
                                  value={breakItem.label}
                                  onChange={(e) => updateBreak(day, index, 'label', e.target.value)}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Start
                                </label>
                                <input
                                  type="time"
                                  value={breakItem.start}
                                  onChange={(e) => updateBreak(day, index, 'start', e.target.value)}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  End
                                </label>
                                <input
                                  type="time"
                                  value={breakItem.end}
                                  onChange={(e) => updateBreak(day, index, 'end', e.target.value)}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => removeBreak(day, index)}
                                >
                                  <FaTrash className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Appointment Settings */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Appointment Settings
        </h2>

        <div className="max-w-md">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Default Appointment Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              step="15"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`mt-2 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Standard duration for each appointment (in 15-minute increments)
            </p>
          </div>
        </div>
      </Card>
      </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default DentistSchedule