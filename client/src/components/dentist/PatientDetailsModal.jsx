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
import { Button, StatusBadge, Card } from '../index'
import { useTheme } from '../../contexts/ThemeContext'

const PatientDetailsModal = ({ isOpen, onClose, patientData, onEdit, asFullPage = false }) => {
  const { isDarkMode} = useTheme()
  const [activeTab, setActiveTab] = useState('information')

  if (!isOpen || !patientData) return null

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
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
      month: 'short',
      day: 'numeric'
    })
  }

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

  // Mock data for appointments, treatments, and payments
  const mockAppointments = [
    {
      id: 1,
      date: '2024-02-20',
      time: '10:00 AM',
      treatment: 'Dental Cleaning',
      status: 'PENDING',
      duration: 30,
      cost: 200
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '2:00 PM',
      treatment: 'Root Canal',
      status: 'COMPLETED',
      duration: 60,
      cost: 800
    },
    {
      id: 3,
      date: '2023-12-10',
      time: '11:30 AM',
      treatment: 'Checkup',
      status: 'COMPLETED',
      duration: 20,
      cost: 150
    }
  ]

  const mockTreatments = [
    {
      id: 1,
      type: 'Root Canal',
      tooth: '14',
      status: 'In Progress',
      startDate: '2024-01-10',
      cost: 1200,
      paid: 800,
      steps: [
        { name: 'Initial Consultation', status: 'completed', date: '2024-01-10' },
        { name: 'Root Canal Procedure', status: 'completed', date: '2024-01-15' },
        { name: 'Crown Placement', status: 'pending', date: '2024-02-20' }
      ]
    },
    {
      id: 2,
      type: 'Dental Cleaning',
      tooth: 'All',
      status: 'Completed',
      startDate: '2023-12-10',
      cost: 150,
      paid: 150,
      steps: [
        { name: 'Cleaning', status: 'completed', date: '2023-12-10' }
      ]
    }
  ]

  const mockPayments = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Root Canal - Session 2',
      amount: 400,
      method: 'Credit Card',
      status: 'Paid'
    },
    {
      id: 2,
      date: '2024-01-10',
      description: 'Root Canal - Initial',
      amount: 400,
      method: 'Cash',
      status: 'Paid'
    },
    {
      id: 3,
      date: '2023-12-10',
      description: 'Dental Cleaning',
      amount: 150,
      method: 'Insurance',
      status: 'Paid'
    }
  ]

  const tabs = [
    { id: 'information', label: 'Information', icon: FaUser },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarCheck },
    { id: 'treatments', label: 'Treatments', icon: FaStethoscope },
    { id: 'payments', label: 'Payments', icon: FaMoneyBillWave }
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
      {/* Personal Information */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaUser className="text-teal-500" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Full Name</label>
            <p className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {patientData.name || `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'N/A'}
            </p>
          </div>
          
          <div>
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Date of Birth</label>
            <div className="flex items-center gap-2 mt-1">
              <FaBirthdayCake className="text-teal-500" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {formatDate(patientData.dateOfBirth)}
                {patientData.dateOfBirth && (
                  <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({calculateAge(patientData.dateOfBirth)} years)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Gender</label>
            <div className="flex items-center gap-2 mt-1">
              <FaVenusMars className="text-teal-500" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.gender ? 
                  patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : 
                  'Not specified'
                }
              </p>
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                patientData.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {patientData.status?.charAt(0).toUpperCase() + patientData.status?.slice(1) || 'Active'}
              </span>
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Phone Number</label>
            <div className="flex items-center gap-2 mt-1">
              <FaPhone className="text-teal-500" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.phone || 'Not provided'}
              </p>
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Email Address</label>
            <div className="flex items-center gap-2 mt-1">
              <FaEnvelope className="text-teal-500" />
              <p className={`break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {patientData.email || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Address</label>
            <div className="flex items-start gap-2 mt-1">
              <FaMapMarkerAlt className="text-teal-500 mt-1" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.address || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaMedkit className="text-purple-500" />
          Medical Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium flex items-center gap-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <FaHistory className="w-4 h-4" />
              Medical History
            </label>
            <div className={`mt-2 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
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
          </div>

          <div>
            <label className={`text-sm font-medium flex items-center gap-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <FaExclamationTriangle className="w-4 h-4 text-red-500" />
              Allergies
            </label>
            <div className={`mt-2 p-3 rounded-lg border-2 ${
              isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'
            }`}>
              <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
                {patientData.allergies || 'No known allergies'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Insurance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <FaIdCard className="text-orange-500" />
            Emergency Contact
          </h3>
          <div className="space-y-3">
            <div>
              <label className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Name</label>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.emergencyContact || 'Not provided'}
              </p>
            </div>
            <div>
              <label className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Phone</label>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.emergencyPhone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <FaShieldAlt className="text-blue-500" />
            Insurance
          </h3>
          <div className="space-y-3">
            <div>
              <label className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Provider</label>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.insuranceProvider || 'Not provided'}
              </p>
            </div>
            <div>
              <label className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Policy #</label>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {patientData.insuranceNumber || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Statistics */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Patient Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
              {patientData.totalVisits || 0}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Visits
            </p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {mockTreatments.length}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Treatments
            </p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {mockAppointments.length}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Appointments
            </p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {formatDate(patientData.lastVisit)}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last Visit
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      {/* Medical History */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
      </div>

      {/* Allergies */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
      </div>

      {/* Current Medications */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
      </div>

      {/* Notes */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
          {mockTreatments.length} treatments
        </span>
      </div>

      {mockTreatments.map((treatment) => (
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
                    {treatment.type}
                  </h4>
                  {treatment.tooth !== 'All' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-xs">
                      <FaTooth className="w-3 h-3" />
                      <span>Tooth #{treatment.tooth}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Started: {formatDate(treatment.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      treatment.status === 'Completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {treatment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Steps */}
          <div className="ml-14 space-y-2">
            <h5 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Treatment Steps:
            </h5>
            {treatment.steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {step.status === 'completed' ? (
                    <FaCheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <FaHourglassHalf className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {step.name}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(step.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Progress */}
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Payment Progress
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {treatment.paid} / {treatment.cost} EGP
              </span>
            </div>
            <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                style={{ width: `${(treatment.paid / treatment.cost) * 100}%` }}
              />
            </div>
            {treatment.cost > treatment.paid && (
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Remaining: {treatment.cost - treatment.paid} EGP
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderPayments = () => {
    const totalPaid = mockPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalCost = mockTreatments.reduce((sum, treatment) => sum + treatment.cost, 0)
    const totalRemaining = mockTreatments.reduce((sum, treatment) => sum + (treatment.cost - treatment.paid), 0)
    
    return (
      <div className="space-y-4">
        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                Total Paid
              </p>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalPaid} EGP
            </p>
          </div>

          <div className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <FaFileInvoiceDollar className="w-5 h-5 text-blue-600" />
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Total Cost
              </p>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalCost} EGP
            </p>
          </div>

          <div className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-700' : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                Remaining
              </p>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalRemaining} EGP
            </p>
          </div>
        </div>

        {/* Payment History */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Payment History
          </h3>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {mockPayments.length} transactions
          </span>
        </div>

        {mockPayments.map((payment) => (
          <div key={payment.id} className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <FaMoneyBillWave className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {payment.description}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {formatDate(payment.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCreditCard className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {payment.method}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {payment.amount} EGP
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'information':
        return renderInformation()
      case 'appointments':
        return renderAppointments()
      case 'treatments':
        return renderTreatments()
      case 'payments':
        return renderPayments()
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
                  Patient ID: #{patientData.id || 'N/A'} • {patientData.phone || 'No phone'}
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
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
    </div>
  )
}

export default PatientDetailsModal