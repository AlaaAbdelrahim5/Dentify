import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  FaTimes, FaEdit, FaCalendarAlt, FaDollarSign, FaStethoscope, 
  FaUser, FaStickyNote, FaTooth, FaPlus, FaXRay, FaMoneyBillWave,
  FaExclamationTriangle, FaClock, FaCheckCircle, FaEye, FaPhone,
  FaTimesCircle
} from 'react-icons/fa'
import Button from '../Button'
import TreatmentTeethStatus from './TreatmentTeethStatus'
import { Card, LoadingSpinner } from '../index'
import { appointmentsAPI } from '../../services/api'

const TreatmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  treatmentData, 
  onEdit, 
  onUpdateStatus,
  onAddPayment,
  onRequestRadiology,
  payments = [],
  asFullPage = false // New prop to render as full page instead of modal
}) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview') // overview, payments, appointments
  const [appointments, setAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  if (!isOpen || !treatmentData) return null

  // Fetch appointments for this treatment
  useEffect(() => {
    if (isOpen && treatmentData && activeTab === 'appointments') {
      fetchTreatmentAppointments()
    }
  }, [isOpen, treatmentData, activeTab])

  const fetchTreatmentAppointments = async () => {
    try {
      setLoadingAppointments(true)
      const response = await appointmentsAPI.getDentistAppointments()
      // Filter appointments that are linked to this treatment
      const treatmentAppointments = response.appointments.filter(
        apt => apt.treatmentId === treatmentData.id
      )
      setAppointments(treatmentAppointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

  const remainingBalance = treatmentData.totalAmount - treatmentData.paidAmount
  const paymentProgress = (treatmentData.paidAmount / treatmentData.totalAmount) * 100

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'In Progress':
        return {
          icon: FaClock,
          label: 'In Progress',
          className: isDarkMode 
            ? 'bg-green-900/30 text-green-400 border-green-600' 
            : 'bg-green-100 text-green-700 border-green-400'
        }
      case 'Completed':
        return {
          icon: FaCheckCircle,
          label: 'Completed',
          className: isDarkMode 
            ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
            : 'bg-blue-100 text-blue-700 border-blue-400'
        }
      case 'Cancelled':
        return {
          icon: FaTimes,
          label: 'Cancelled',
          className: isDarkMode 
            ? 'bg-red-900/30 text-red-400 border-red-600' 
            : 'bg-red-100 text-red-700 border-red-400'
        }
      default:
        return {
          icon: FaClock,
          label: status,
          className: isDarkMode 
            ? 'bg-gray-800 text-gray-300 border-gray-600' 
            : 'bg-white text-gray-700 border-gray-300'
        }
    }
  }

  const statusDisplay = getStatusDisplay(treatmentData.treatmentStatus)
  const StatusIcon = statusDisplay.icon

  // Render content without modal wrapper if used as full page
  const content = (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
          }`}>
            <FaStethoscope className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {treatmentData.treatmentType}
            </h2>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Patient: {treatmentData.patientName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {treatmentData.priority && (
            <div className={`
              px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium
              ${treatmentData.priority === 'High' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                : treatmentData.priority === 'Medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }
            `}>
              <FaExclamationTriangle className="w-3 h-3" />
              {treatmentData.priority}
            </div>
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
            <StatusIcon className="w-3 h-3" />
            {statusDisplay.label}
          </span>
          {!asFullPage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(treatmentData)}
              >
                <FaEdit className="w-4 h-4" />
              </Button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

        {/* Tabs Navigation */}
        <div className={`flex gap-1 p-3 border-b ${
          isDarkMode ? 'border-gray-600 bg-gray-600/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all duration-200
              ${activeTab === 'overview'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all duration-200
              ${activeTab === 'payments'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all duration-200
              ${activeTab === 'appointments'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Appointments
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className={`flex-1 overflow-y-auto p-5 ${
          isDarkMode ? 'bg-gray-600/20' : 'bg-gray-50'
        }`}>{activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100'}>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                          Created
                        </p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
                          {new Date(treatmentData.creationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <FaCalendarAlt className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                  </Card.Content>
                </Card>

                <Card className={isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-green-100'}>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-green-600'}`}>
                          Total Cost
                        </p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-green-900'}`}>
                          ${treatmentData.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <FaDollarSign className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                    </div>
                  </Card.Content>
                </Card>

                <Card className={isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-purple-50 to-purple-100'}>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-purple-600'}`}>
                          Affected Teeth
                        </p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                          {treatmentData.teethStatus?.length || 0} Teeth
                        </p>
                      </div>
                      <FaTooth className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Description */}
              {treatmentData.description && (
                <Card>
                  <Card.Header>
                    <h3 className={`font-semibold text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Treatment Description
                    </h3>
                  </Card.Header>
                  <Card.Content>
                    <p className={`text-base leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {treatmentData.description}
                    </p>
                  </Card.Content>
                </Card>
              )}

              {/* Affected Teeth */}
              {treatmentData.teethStatus && treatmentData.teethStatus.length > 0 && (
                <Card>
                  <Card.Header>
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <FaTooth className="w-5 h-5 text-teal-500" />
                      Affected Teeth ({treatmentData.teethStatus.length})
                    </h3>
                  </Card.Header>
                  <Card.Content>
                    <TreatmentTeethStatus teethStatus={treatmentData.teethStatus} />
                  </Card.Content>
                </Card>
              )}

              {/* Notes */}
              {treatmentData.notes && (
                <Card>
                  <Card.Header>
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <FaStickyNote className="w-5 h-5 text-yellow-500" />
                      Clinical Notes
                    </h3>
                  </Card.Header>
                  <Card.Content>
                    <p className={`text-base leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {treatmentData.notes}
                    </p>
                  </Card.Content>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Quick Actions
                  </h3>
                </Card.Header>
                <Card.Content>
                  <div className="flex flex-wrap gap-3">
                    {treatmentData.treatmentStatus === 'In Progress' && (
                      <Button
                        variant="primary"
                        onClick={() => onUpdateStatus(treatmentData.id, 'Completed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FaCheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                    {onRequestRadiology && (
                      <Button
                        variant="outline"
                        onClick={() => onRequestRadiology(treatmentData)}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <FaXRay className="w-4 h-4 mr-2" />
                        Request Radiology
                      </Button>
                    )}
                    {treatmentData.treatmentStatus !== 'Cancelled' && treatmentData.treatmentStatus !== 'Completed' && (
                      <Button
                        variant="outline"
                        onClick={() => onUpdateStatus(treatmentData.id, 'Cancelled')}
                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cancel Treatment
                      </Button>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-green-100'}>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-green-600'}`}>
                          Total Cost
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-green-900'}`}>
                          ${treatmentData.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <FaDollarSign className={`w-10 h-10 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                    </div>
                  </Card.Content>
                </Card>

                <Card className={isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-teal-50 to-teal-100'}>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-teal-600'}`}>
                          Total Paid
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                          ${treatmentData.paidAmount.toFixed(2)}
                        </p>
                      </div>
                      <FaMoneyBillWave className={`w-10 h-10 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                    </div>
                  </Card.Content>
                </Card>

                <Card className={isDarkMode ? 'bg-gray-700/50' : remainingBalance > 0 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100' 
                  : 'bg-gradient-to-br from-green-50 to-green-100'
                }>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' 
                          : remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {remainingBalance > 0 ? 'Balance Due' : 'Fully Paid'}
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' 
                          : remainingBalance > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                          ${remainingBalance.toFixed(2)}
                        </p>
                      </div>
                      <FaDollarSign className={`w-10 h-10 ${isDarkMode ? 'text-orange-400' 
                        : remainingBalance > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Payment Progress */}
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Payment Progress
                  </h3>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {paymentProgress.toFixed(0)}% Complete
                      </span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {payments?.length || 0} Payment{payments?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className={`w-full h-4 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          paymentProgress === 100 
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-teal-500 to-teal-600'
                        }`}
                        style={{ width: `${paymentProgress}%` }}
                      />
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Payment History */}
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Payment History
                  </h3>
                </Card.Header>
                <Card.Content>
                  {payments && payments.length > 0 ? (
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className={`
                        grid grid-cols-6 gap-4 p-3 rounded-lg font-semibold text-sm uppercase tracking-wide
                        ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}
                      `}>
                        <div>DATE</div>
                        <div>PATIENT</div>
                        <div>TREATMENT</div>
                        <div>AMOUNT</div>
                        <div>METHOD</div>
                        <div>NOTES</div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-2">
                        {payments.map((payment, index) => (
                          <div
                            key={index}
                            className={`
                              grid grid-cols-6 gap-4 p-3 rounded-lg border items-center
                              ${isDarkMode 
                                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                              }
                              transition-colors
                            `}
                          >
                            {/* Date */}
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className={`w-4 h-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Patient Name */}
                            <div className="flex items-center gap-2">
                              <FaUser className={`w-4 h-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {payment.treatment?.patient 
                                  ? `${payment.treatment.patient.firstName} ${payment.treatment.patient.lastName}`
                                  : treatmentData.patientName
                                }
                              </span>
                            </div>

                            {/* Treatment Type */}
                            <div>
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {payment.treatment?.treatmentType || treatmentData.treatmentType}
                              </span>
                            </div>

                            {/* Amount */}
                            <div>
                              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ${payment.amount.toFixed(2)}
                              </span>
                            </div>

                            {/* Payment Method */}
                            <div>
                              <span className={`
                                px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1
                                ${payment.method === 'CASH'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                }
                              `}>
                                <FaDollarSign className="w-3 h-3" />
                                {payment.method === 'CASH' ? 'Cash' : 'Card'}
                              </span>
                            </div>

                            {/* Notes */}
                            <div>
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {payment.notes || '-'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Results Count */}
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Showing {payments.length} result{payments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaMoneyBillWave className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No payments recorded yet
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Linked Appointments
                  </h3>
                </Card.Header>
                <Card.Content>
                  {loadingAppointments ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className={`
                        grid grid-cols-3 gap-4 p-3 rounded-lg font-semibold text-sm uppercase tracking-wide
                        ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}
                      `}>
                        <div>DATE</div>
                        <div>TIME</div>
                        <div>STATUS</div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-2">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`
                              grid grid-cols-3 gap-4 p-3 rounded-lg border items-center
                              ${isDarkMode 
                                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                              }
                              transition-colors
                            `}
                          >
                            {/* Date */}
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className={`w-4 h-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2">
                              <FaClock className={`w-4 h-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {new Date(appointment.startTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })} - {new Date(appointment.endTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>

                            {/* Status */}
                            <div>
                              <span className={`
                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                ${appointment.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : appointment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : appointment.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }
                              `}>
                                {appointment.status === 'CONFIRMED' && <FaCheckCircle className="w-3 h-3" />}
                                {appointment.status === 'CANCELLED' && <FaTimesCircle className="w-3 h-3" />}
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Results Count */}
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaCalendarAlt className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No appointments linked to this treatment
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}
        </div>

        {/* Footer - Only show in modal mode */}
        {!asFullPage && (
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    )

  // Wrap content in modal backdrop if not full page
  if (asFullPage) {
    return content
  }

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
          {content}
        </div>
      </div>
    </div>
  )
}

export default TreatmentDetailsModal
