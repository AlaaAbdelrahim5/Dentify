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
  FaStickyNote,
  FaBirthdayCake,
  FaHistory,
  FaClipboardList,
  FaPills,
  FaExclamationTriangle,
  FaShieldAlt,
  FaEdit,
  FaFileAlt,
  FaCalendarCheck
} from 'react-icons/fa'
import { Button, Card } from '../index'
import { useTheme } from '../../contexts/ThemeContext'

const PatientDetailsModal = ({ isOpen, onClose, patientData, onEdit }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !patientData) return null

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'medical', label: 'Medical Info', icon: FaMedkit },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarCheck },
    { id: 'documents', label: 'Documents', icon: FaFileAlt }
  ]

  const mockAppointments = [
    {
      id: 1,
      date: '2024-02-20',
      time: '10:00 AM',
      treatment: 'Dental Cleaning',
      status: 'scheduled'
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '2:00 PM',
      treatment: 'Root Canal',
      status: 'completed'
    },
    {
      id: 3,
      date: '2023-12-10',
      time: '11:30 AM',
      treatment: 'Checkup',
      status: 'completed'
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaUser className="text-teal-600" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Full Name</label>
              <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {patientData.firstName || patientData.name || 'N/A'} {patientData.lastName || ''}
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Date of Birth</label>
              <div className="flex items-center gap-2">
                <FaBirthdayCake className="text-teal-600" />
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {formatDate(patientData.dateOfBirth)} 
                  {patientData.dateOfBirth && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Age: {calculateAge(patientData.dateOfBirth)} years)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Gender</label>
              <div className="flex items-center gap-2">
                <FaVenusMars className="text-teal-600" />
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {patientData.gender ? 
                    patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : 
                    'Not specified'
                  }
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm border ${
                getStatusColor(patientData.status)
              }`}>
                {patientData.status?.charAt(0).toUpperCase() + patientData.status?.slice(1) || 'Active'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Phone Number</label>
              <div className="flex items-center gap-2">
                <FaPhone className="text-teal-600" />
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {patientData.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Email Address</label>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-teal-600" />
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {patientData.email || 'Not provided'}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Address</label>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-teal-600 mt-1" />
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {patientData.address || 'Not provided'}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Visits</label>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {patientData.totalVisits || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaIdCard className="text-teal-600" />
          Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Contact Name</label>
            <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {patientData.emergencyContact || 'Not provided'}
            </p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Contact Phone</label>
            <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {patientData.emergencyPhone || 'Not provided'}
            </p>
          </div>
        </div>
      </Card>

      {/* Insurance Information */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaShieldAlt className="text-teal-600" />
          Insurance Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Provider</label>
            <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {patientData.insuranceProvider || 'Not provided'}
            </p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Policy Number</label>
            <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {patientData.insuranceNumber || 'Not provided'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      {/* Medical History */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaHistory className="text-teal-600" />
          Medical History
        </h3>
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {patientData.medicalHistory && patientData.medicalHistory.length > 0 
              ? (Array.isArray(patientData.medicalHistory) 
                  ? patientData.medicalHistory.join(', ')
                  : patientData.medicalHistory)
              : 'No medical history recorded'
            }
          </p>
        </div>
      </Card>

      {/* Allergies */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaExclamationTriangle className="text-red-500" />
          Allergies
        </h3>
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {patientData.allergies || 'No known allergies'}
          </p>
        </div>
      </Card>

      {/* Current Medications */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaPills className="text-blue-500" />
          Current Medications
        </h3>
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {patientData.currentMedications || 'No current medications'}
          </p>
        </div>
      </Card>

      {/* Notes */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaStickyNote className="text-yellow-500" />
          Additional Notes
        </h3>
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {patientData.notes || 'No additional notes'}
          </p>
        </div>
      </Card>
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
          <Card key={appointment.id} className={`p-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {appointment.treatment}
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
          </Card>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'medical':
        return renderMedicalInfo()
      case 'appointments':
        return renderAppointments()
      case 'documents':
        return renderDocuments()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
            }`}>
              <FaUser className="text-teal-600 text-xl" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {patientData.firstName || patientData.name || 'Patient'} {patientData.lastName || ''}
              </h2>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Patient ID: #{patientData.id || 'N/A'} • {patientData.phone || 'No phone'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onEdit(patientData)}
            >
              <FaEdit className="w-4 h-4 mr-2" />
              Edit Patient
            </Button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaTimes className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </button>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default PatientDetailsModal