import { useState } from 'react'
import { 
  FaTimes,
  FaStethoscope,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaStickyNote,
  FaFileAlt,
  FaTooth,
  FaExclamationTriangle,
  FaEdit,
  FaCheck,
  FaPlay,
  FaPause,
  FaHistory,
  FaClipboardList
} from 'react-icons/fa'
import { Button, Card } from '../index'
import { useTheme } from '../../contexts/ThemeContext'

const TreatmentDetailsModal = ({ isOpen, onClose, treatmentData, onEdit, onUpdateStatus }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !treatmentData) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planned':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck className="text-green-600" />
      case 'in-progress':
        return <FaPlay className="text-blue-600" />
      case 'planned':
        return <FaCalendarAlt className="text-purple-600" />
      case 'on-hold':
        return <FaPause className="text-yellow-600" />
      case 'cancelled':
        return <FaTimes className="text-red-600" />
      default:
        return <FaCalendarAlt className="text-gray-600" />
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaStethoscope },
    { id: 'details', label: 'Details', icon: FaFileAlt },
    { id: 'progress', label: 'Progress', icon: FaHistory },
    { id: 'instructions', label: 'Instructions', icon: FaClipboardList }
  ]

  const mockProgressEntries = [
    {
      id: 1,
      date: '2024-01-20',
      status: 'started',
      notes: 'Initial examination completed. X-rays taken.',
      dentist: 'Dr. Smith'
    },
    {
      id: 2,
      date: '2024-01-18',
      status: 'planned',
      notes: 'Treatment plan created and discussed with patient.',
      dentist: 'Dr. Smith'
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Treatment Summary */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
            }`}>
              <FaTooth className="text-teal-600 text-xl" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {treatmentData.treatmentType}
              </h3>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {treatmentData.toothNumber ? `Tooth #${treatmentData.toothNumber}` : 'General Treatment'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm border ${
              getPriorityColor(treatmentData.priority)
            }`}>
              {treatmentData.priority?.charAt(0).toUpperCase() + treatmentData.priority?.slice(1)} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${
              getStatusColor(treatmentData.status)
            }`}>
              {getStatusIcon(treatmentData.status)}
              {treatmentData.status?.charAt(0).toUpperCase() + treatmentData.status?.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Patient</label>
            <div className="flex items-center gap-2 mt-1">
              <FaUser className="text-teal-600" />
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {treatmentData.patientName || 'Patient Name'}
              </p>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Estimated Duration</label>
            <div className="flex items-center gap-2 mt-1">
              <FaClock className="text-teal-600" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {treatmentData.estimatedDuration} minutes
              </p>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Estimated Cost</label>
            <div className="flex items-center gap-2 mt-1">
              <FaDollarSign className="text-teal-600" />
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${treatmentData.estimatedCost || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Treatment Timeline
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Start Date</label>
            <div className="flex items-center gap-2 mt-1">
              <FaCalendarAlt className="text-teal-600" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {formatDate(treatmentData.startDate)}
              </p>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Expected Completion</label>
            <div className="flex items-center gap-2 mt-1">
              <FaCalendarAlt className="text-teal-600" />
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {formatDate(treatmentData.completionDate)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Quick Actions
        </h4>
        
        <div className="flex flex-wrap gap-3">
          {treatmentData.status === 'planned' && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onUpdateStatus && onUpdateStatus(treatmentData.id, 'in-progress')}
            >
              <FaPlay className="w-4 h-4 mr-2" />
              Start Treatment
            </Button>
          )}
          
          {treatmentData.status === 'in-progress' && (
            <>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onUpdateStatus && onUpdateStatus(treatmentData.id, 'completed')}
              >
                <FaCheck className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdateStatus && onUpdateStatus(treatmentData.id, 'on-hold')}
              >
                <FaPause className="w-4 h-4 mr-2" />
                Put On Hold
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit && onEdit(treatmentData)}
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Treatment
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Treatment Description */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Treatment Description
        </h4>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {treatmentData.description || 'No description provided'}
        </p>
      </Card>

      {/* Pre-conditions */}
      {treatmentData.preConditions && (
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Pre-conditions & Prerequisites
          </h4>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {treatmentData.preConditions}
          </p>
        </Card>
      )}

      {/* Notes */}
      {treatmentData.notes && (
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <FaStickyNote className="text-yellow-500" />
            Additional Notes
          </h4>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {treatmentData.notes}
          </p>
        </Card>
      )}
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Treatment Progress
        </h4>
        <Button variant="primary" size="sm">
          <FaFileAlt className="w-4 h-4 mr-2" />
          Add Progress Note
        </Button>
      </div>

      <div className="space-y-3">
        {mockProgressEntries.map((entry) => (
          <Card key={entry.id} className={`p-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaHistory className="text-teal-600" />
                  <h5 className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {formatDate(entry.date)}
                  </h5>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.status === 'started' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {entry.status}
                  </span>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {entry.notes}
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  By: {entry.dentist}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderInstructions = () => (
    <div className="space-y-6">
      {/* Post-care Instructions */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaClipboardList className="text-teal-600" />
          Post-treatment Care Instructions
        </h4>
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {treatmentData.postCareInstructions || 'No specific post-care instructions provided'}
          </p>
        </div>
      </Card>

      {/* Follow-up Requirements */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Follow-up Requirements
        </h4>
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Follow-up appointment recommended in 1-2 weeks to monitor healing progress.
          </p>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'details':
        return renderDetails()
      case 'progress':
        return renderProgress()
      case 'instructions':
        return renderInstructions()
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
              <FaStethoscope className="text-teal-600 text-xl" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {treatmentData.treatmentType}
              </h2>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Treatment ID: #{treatmentData.id} • {treatmentData.patientName || 'Patient'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onEdit && onEdit(treatmentData)}
            >
              <FaEdit className="w-4 h-4 mr-2" />
              Edit Treatment
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

export default TreatmentDetailsModal