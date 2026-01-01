import { useState } from 'react'
import { 
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaVenusMars,
  FaMedkit,
  FaBirthdayCake,
  FaHistory,
  FaExclamationTriangle,
  FaShieldAlt,
  FaEdit,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaStethoscope,
  FaTooth,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaPills,
  FaStickyNote,
  FaFileAlt
} from 'react-icons/fa'
import { Button, StatusBadge, Card, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { calculateAge, formatDate, getImageUrl } from '../../../utils/helpers'
import TeethHistoryTab from '../treatment/TeethHistoryTab'
import AppointmentsHistoryTab from '../appointment/AppointmentsHistoryTab'

const PatientDetailsModal = ({ 
  isOpen, 
  onClose, 
  patientData, 
  onEdit, 
  asFullPage = false,
  treatments = [],
  appointments = [],
  payments = []
}) => {
  const { isDarkMode} = useTheme()
  const [activeTab, setActiveTab] = useState('information')

  if (!isOpen || !patientData) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
      default:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
    }
  }

  const tabs = [
    { id: 'information', label: 'Information', icon: FaUser },
    { id: 'treatments', label: 'Treatments', icon: FaStethoscope },
    { id: 'teethHistory', label: 'Teeth History', icon: FaTooth },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt }
  ]

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return FaCheckCircle
      case 'PENDING':
        return FaHourglassHalf
      case 'COMPLETED':
        return FaCheckCircle
      case 'CANCELLED':
        return FaTimesCircle
      default:
        return FaHourglassHalf
    }
  }

  const renderInformation = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Name */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaUser className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Patient Name
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {patientData.name || `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'N/A'}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaBirthdayCake className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Date of Birth
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatDate(patientData.dateOfBirth)}
              </p>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {calculateAge(patientData.dateOfBirth)} years old
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaVenusMars className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Gender
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {patientData.gender ? 
                  patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : 
                  'Not specified'
                }
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaCheckCircle className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Status
              </p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  patientData.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}></span>
                <p className={`font-semibold ${
                  patientData.status?.toLowerCase() === 'active' 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {patientData.status?.charAt(0).toUpperCase() + patientData.status?.slice(1).toLowerCase() || 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaPhone className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Phone Number
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {patientData.phone || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaEnvelope className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Email Address
              </p>
              <p className={`font-semibold wrap-break-word ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {patientData.email || 'Not provided'}
              </p>
            </div>
          </div>

          {/* City/Location */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaMapMarkerAlt className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                City
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {patientData.city || patientData.address || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Dates */}
        {(patientData.user?.createdAt || patientData.userId?.createdAt) && (
          <div className={`mt-4 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              {(patientData.user?.createdAt || patientData.userId?.createdAt) && (
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Registered On
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {formatDate(patientData.user?.createdAt || patientData.userId?.createdAt)}
                  </p>
                </div>
              )}
              {(patientData.user?.updatedAt || patientData.userId?.updatedAt) && (
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Last Updated
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {formatDate(patientData.user?.updatedAt || patientData.userId?.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      {/* Medical History */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FaHistory className="text-teal-500 text-xl" />
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Medical History
          </h3>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {patientData.medicalHistory && patientData.medicalHistory.length > 0 
            ? (Array.isArray(patientData.medicalHistory) 
                ? patientData.medicalHistory.join(', ')
                : patientData.medicalHistory)
            : 'No medical history recorded'
          }
        </p>
      </div>

      {/* Allergies */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Allergies
          </h3>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {patientData.allergies || 'No known allergies'}
        </p>
      </div>

      {/* Current Medications */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FaPills className="text-blue-500 text-xl" />
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Current Medications
          </h3>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {patientData.currentMedications || 'No current medications'}
        </p>
      </div>

      {/* Notes */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FaStickyNote className="text-yellow-500 text-xl" />
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Additional Notes
          </h3>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {patientData.notes || 'No additional notes'}
        </p>
      </div>
    </div>
  )

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Appointment History
        </h3>
        <Button variant="primary" size="sm">
          <FaCalendarAlt className="w-4 h-4 mr-2" />
          Schedule New
        </Button>
      </div>

      <div className="space-y-3">
        {mockAppointments.map((appointment) => (
          <div key={appointment.id} className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {appointment.treatment?.treatmentName || 'General Appointment'}
                </h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {formatDate(appointment.date)} at {appointment.time}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                appointment.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : appointment.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Patient Documents
        </h3>
        <Button variant="primary" size="sm">
          <FaFileAlt className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="text-center py-12">
        <FaFileAlt className={`w-16 h-16 mx-auto mb-4 ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          No Documents Available
        </h3>
        <p className={`${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Upload patient documents, X-rays, or treatment plans
        </p>
      </div>
    </div>
  )

  const renderTreatments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Treatment Plans
        </h3>
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {treatments.length} treatments
        </span>
      </div>

      {treatments.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FaStethoscope className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
          <p>No treatments found for this patient</p>
        </div>
      ) : (
        treatments.map((treatment) => (
        <div key={treatment.id} className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                <FaStethoscope className="text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {treatment.treatmentName}
                  </h4>
                  {treatment.teethStatus && treatment.teethStatus.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-xs">
                      <FaTooth className="w-3 h-3" />
                      <span>{treatment.teethStatus.length} Teeth</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Started: {formatDate(treatment.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      treatment.status === 'Completed'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : treatment.status === 'In Progress'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {treatment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Payment Progress
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ${treatment.paidAmount.toFixed(2)} / ${treatment.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-linear-to-r from-green-500 to-green-600 rounded-full"
                style={{ width: `${(treatment.paidAmount / treatment.totalAmount) * 100}%` }}
              />
            </div>
            {treatment.totalAmount > treatment.paidAmount && (
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Remaining: ${(treatment.totalAmount - treatment.paidAmount).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        ))
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'information':
        return renderInformation()
      case 'treatments':
        return renderTreatments()
      case 'teethHistory':
        return <TeethHistoryTab treatments={treatments} />
      case 'appointments':
        return <AppointmentsHistoryTab appointments={appointments} />
      default:
        return renderInformation()
    }
  }

  // Full Page Layout
  if (asFullPage) {
    return (
      <div className="space-y-6">
        {/* Patient Header Card */}
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
              }`}>
                <FaUser className="text-teal-600 text-2xl" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {patientData.firstName || patientData.name || 'Patient'} {patientData.lastName || ''}
                </h2>
                <p className={`text-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {patientData.gender ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : ''} • {calculateAge(patientData.dateOfBirth)} years
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`flex border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? 'text-teal-400 border-b-2 border-teal-400 bg-gray-750'
                        : 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </Card>
      </div>
    )
  }

  // Modal Layout (default)
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Details"
      size="4xl"
    >
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            {patientData.user?.profileImage || patientData.profileImage ? (
              <img
                src={getImageUrl(patientData.user?.profileImage || patientData.profileImage)}
                alt={`${patientData.firstName} ${patientData.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-20 h-20 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center justify-center ${patientData.user?.profileImage || patientData.profileImage ? 'hidden' : ''}`}>
              <FaUser className="w-10 h-10 text-teal-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {patientData.firstName || patientData.name || 'Patient'} {patientData.lastName || ''}
            </h3>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {patientData.gender ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : ''} • {calculateAge(patientData.dateOfBirth)} years
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              patientData.status?.toLowerCase() === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {patientData.status?.toLowerCase() === 'active' ? (
                <FaCheckCircle className="w-3 h-3" />
              ) : (
                <FaTimesCircle className="w-3 h-3" />
              )}
              {patientData.status?.charAt(0).toUpperCase() + patientData.status?.slice(1).toLowerCase() || 'Inactive'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'text-teal-400 border-b-2 border-teal-400 bg-gray-750'
                      : 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-400px)]">
          {renderTabContent()}
        </div>
      </div>
    </BaseModal>
  )
}

export default PatientDetailsModal