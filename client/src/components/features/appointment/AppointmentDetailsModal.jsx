import { useState } from 'react'
import { 
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaStickyNote,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaCheck,
  FaCheckCircle
} from 'react-icons/fa'
import { Button, StatusBadge, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate as formatDateHelper, formatTime } from '../../../utils/helpers'
import { FaTimes } from 'react-icons/fa'

const AppointmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  appointment,
  onEdit,
  onCancel,
  onConfirm,
  onComplete
}) => {
  const { isDarkMode } = useTheme()

  if (!appointment) return null

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return FaCheckCircle
      case 'PENDING':
        return FaClock
      case 'COMPLETED':
        return FaCheckCircle
      case 'CANCELLED':
        return FaTimes
      default:
        return FaClock
    }
  }

  const formatDateLong = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDuration = () => {
    const start = new Date(appointment.startTime)
    const end = new Date(appointment.endTime)
    const duration = Math.round((end - start) / 60000) // minutes
    return duration
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={true}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-full ${
          isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
        }`}>
          <FaCalendarAlt className={`w-6 h-6 ${
            isDarkMode ? 'text-teal-400' : 'text-teal-600'
          }`} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Appointment Details
          </h2>
          <div className="mt-1">
            <StatusBadge 
              status={appointment.status?.toLowerCase()}
              icon={getStatusIcon(appointment.status)}
              label={appointment.status?.charAt(0) + appointment.status?.slice(1).toLowerCase()}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
            
            {/* Patient Information */}
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <FaUser className="w-5 h-5 text-teal-500" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Name</label>
                  <p className={`mt-1 font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {appointment.patient?.name || 
                     `${appointment.patient?.firstName} ${appointment.patient?.lastName}` ||
                     'N/A'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Phone</label>
                  <p className={`mt-1 flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaPhone className="w-3 h-3" />
                    {appointment.patient?.phone || 
                     appointment.patient?.user?.phone || 
                     'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Email</label>
                  <p className={`mt-1 flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaEnvelope className="w-3 h-3" />
                    {appointment.patient?.email || 
                     appointment.patient?.user?.email || 
                     'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <FaCalendarAlt className="w-5 h-5 text-blue-500" />
                Appointment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date</label>
                  <p className={`mt-1 font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDateLong(appointment.appointmentDate)}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Time</label>
                  <p className={`mt-1 flex items-center gap-2 font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaClock className="w-4 h-4" />
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Duration</label>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {getDuration()} minutes
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Session Cost</label>
                  <p className={`mt-1 flex items-center gap-2 font-semibold text-green-600 dark:text-green-400`}>
                    <FaMoneyBillWave className="w-4 h-4" />
                    {appointment.sessionCost != null ? `${appointment.sessionCost} EGP` : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Treatment Information */}
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <FaStethoscope className="w-5 h-5 text-purple-500" />
                Treatment Information
              </h3>
              <div>
                <label className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Treatment Type</label>
                <p className={`mt-1 font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {appointment.treatment?.treatmentType || 'General Consultation'}
                </p>
              </div>
              {appointment.isTreatment && (
                <div className="mt-3">
                  <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full">
                    Part of Treatment Plan
                  </span>
                </div>
              )}
            </div>

            {/* Clinic Information */}
            {appointment.clinic && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <FaMapMarkerAlt className="w-5 h-5 text-orange-500" />
                  Clinic
                </h3>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {appointment.clinic.name}
                </p>
                {appointment.clinic.address && (
                  <p className={`mt-1 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {appointment.clinic.address}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {(appointment.sessionNotes || appointment.notes) && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <FaStickyNote className="w-5 h-5 text-yellow-500" />
                  Notes
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {appointment.sessionNotes || appointment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            
            {appointment.status?.toUpperCase() === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    onConfirm?.(appointment)
                    onClose()
                  }}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <FaCheck className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onCancel?.(appointment)
                    onClose()
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}

            {appointment.status?.toUpperCase() === 'CONFIRMED' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    onComplete?.(appointment)
                    onClose()
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FaCheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onCancel?.(appointment)
                    onClose()
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}

            {(appointment.status?.toUpperCase() !== 'COMPLETED' && 
              appointment.status?.toUpperCase() !== 'CANCELLED') && (
              <Button
                variant="primary"
                onClick={() => {
                  onEdit?.(appointment)
                  onClose()
                }}
                className="bg-linear-to-r from-teal-600 to-cyan-600"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
    </BaseModal>
  )
}

export default AppointmentDetailsModal
