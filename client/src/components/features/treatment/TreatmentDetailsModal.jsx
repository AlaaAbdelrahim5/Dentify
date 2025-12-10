import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { 
  FaTimes, FaEdit, FaCalendarAlt, FaDollarSign, FaStethoscope, 
  FaUser, FaStickyNote, FaTooth, FaPlus, FaXRay, FaMoneyBillWave,
  FaExclamationTriangle, FaClock, FaCheckCircle, FaEye, FaPhone,
  FaTimesCircle, FaFileInvoiceDollar, FaPrescriptionBottle, FaPrint
} from 'react-icons/fa'
import { Button, Card, LoadingSpinner } from '../../common'
import Toast from '../../common/Toast'
import generatePaymentReceipt from '../payment/PaymentReceipt'
import TreatmentTeethStatus from './TreatmentTeethStatus'
import { appointmentsAPI, treatmentsAPI } from '../../../services/api'
import { authUtils } from '../../../utils/auth'
import { getStatusDisplay as getStatusHelper, calculateRemainingBalance } from '../../../utils/helpers'

const TreatmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  treatmentData, 
  onEdit, 
  onUpdateStatus,
  onAddPayment,
  onRequestRadiology,
  onCreatePrescription, // New prop for prescription
  onRefresh, // New prop to refresh data
  payments = [],
  prescriptions = [], // New prop for prescription history
  asFullPage = false, // New prop to render as full page instead of modal
  readOnly = false // New prop to disable edit actions (for Secretary view)
}) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview') // overview, payments, appointments, prescriptions
  const [appointments, setAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [toast, setToast] = useState(null)

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
      const currentUser = authUtils.getCurrentUser()
      
      // Fetch appointments based on user role
      let response
      if (currentUser?.role === 'Secretary') {
        response = await appointmentsAPI.getClinicAppointments()
      } else {
        response = await appointmentsAPI.getDentistAppointments()
      }
      
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

  const handleMarkToothComplete = async (toothNumber) => {
    try {
      // Update the tooth status to completed
      const updatedTeethStatus = treatmentData.teethStatus.map(tooth => {
        if (tooth.toothNumber === toothNumber) {
          return {
            ...tooth,
            status: 'Completed'
          }
        }
        return tooth
      })
      
      // Update treatment with new teeth status
      await treatmentsAPI.update(treatmentData.id, {
        teethStatus: updatedTeethStatus
      })
      
      setToast({ message: 'Tooth treatment completed successfully!', type: 'success' })
      
      // Refresh the data without closing
      if (onRefresh) {
        await onRefresh()
      }
      
    } catch (error) {
      console.error('Error marking tooth as complete:', error)
      setToast({ message: 'Failed to update tooth status. Please try again.', type: 'error' })
    }
  }

  const handlePrintPrescription = (prescription, index) => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${treatmentData.patientName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #14b8a6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #14b8a6;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .patient-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .patient-info div {
            margin: 5px 0;
          }
          .patient-info strong {
            color: #14b8a6;
          }
          .medications {
            margin-bottom: 30px;
          }
          .medications h2 {
            color: #14b8a6;
            border-bottom: 2px solid #14b8a6;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .medication {
            background: white;
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
          }
          .medication h3 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .medication-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          .medication-detail {
            font-size: 14px;
          }
          .medication-detail strong {
            color: #666;
          }
          .instructions {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-style: italic;
            color: #666;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature {
            margin-top: 40px;
            text-align: right;
          }
          .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-left: auto;
            padding-top: 5px;
            text-align: center;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🦷 Dentify Clinic</h1>
          <p>Medical Prescription</p>
          <p>Prescription #${index + 1} - ${prescription.prescriptionNumber || `RX-${index + 1}`}</p>
        </div>

        <div class="patient-info">
          <div><strong>Patient Name:</strong> ${treatmentData.patientName || 'N/A'}</div>
          <div><strong>Treatment:</strong> ${treatmentData.treatmentType || 'N/A'}</div>
          <div><strong>Date:</strong> ${new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString()}</div>
        </div>

        <div class="medications">
          <h2>💊 Medications</h2>
          ${prescription.medications.map((med, medIndex) => `
            <div class="medication">
              <h3>${medIndex + 1}. ${med.name}</h3>
              <div class="medication-details">
                <div class="medication-detail">
                  <strong>Dosage:</strong> ${med.dosage || 'N/A'}
                </div>
                <div class="medication-detail">
                  <strong>Frequency:</strong> ${med.frequency || 'N/A'}
                </div>
                <div class="medication-detail">
                  <strong>Duration:</strong> ${med.duration || 'N/A'}
                </div>
              </div>
              ${med.instructions ? `
                <div class="instructions">
                  <strong>Instructions:</strong> ${med.instructions}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="signature">
          <div class="signature-line">
            Doctor's Signature
          </div>
        </div>

        <div class="footer">
          <p>This prescription is generated electronically and is valid.</p>
          <p>For any queries, please contact the clinic.</p>
        </div>
      </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const remainingBalance = calculateRemainingBalance(treatmentData.totalAmount, treatmentData.paidAmount, treatmentData.treatmentDiscount)
  const effectiveTotal = treatmentData.totalAmount - (treatmentData.treatmentDiscount || 0)
  const paymentProgress = effectiveTotal > 0 ? (treatmentData.paidAmount / effectiveTotal) * 100 : 0

  const handlePrintComprehensiveReceipt = () => {
    // Generate comprehensive receipt with all payments
    // Handle both dentist and secretary data structures
    const rawTreatment = treatmentData.rawData || treatmentData
    const dentistInfo = rawTreatment.dentist || treatmentData.dentist
    const clinicInfo = dentistInfo?.clinic
    const statusValue = treatmentData.treatmentStatus || treatmentData.status || 'N/A'
    
    // Debug logging
    console.log('=== RECEIPT DEBUG ===')
    console.log('treatmentData:', treatmentData)
    console.log('rawTreatment:', rawTreatment)
    console.log('dentistInfo:', dentistInfo)
    console.log('clinicInfo:', clinicInfo)
    console.log('clinicName options:', {
      fromClinicInfo: clinicInfo?.clinicName,
      fromTreatmentData: treatmentData.clinicName,
      direct: treatmentData.dentist?.clinic?.clinicName,
      rawData: treatmentData.rawData?.dentist?.clinic?.clinicName
    })
    console.log('==================')
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Treatment Receipt #${treatmentData.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #0d9488; }
          .header h1 { font-size: 32px; color: #0d9488; margin-bottom: 8px; }
          .header p { color: #64748b; font-size: 14px; }
          .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; }
          .info-box h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
          .info-row { margin-bottom: 8px; }
          .info-label { font-size: 14px; color: #64748b; display: inline-block; width: 140px; }
          .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
          .summary-section { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .summary-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #0d9488; padding-top: 12px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .invoice-table thead { background: #0d9488; color: white; }
          .invoice-table th { padding: 12px; text-align: left; font-weight: 600; font-size: 14px; }
          .invoice-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .invoice-table tbody tr:last-child td { border-bottom: none; }
          .discount-row { color: #f97316; font-style: italic; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          button { margin-top: 30px; padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.3s; }
          button:hover { background: #0f766e; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TREATMENT RECEIPT</h1>
            <p>Treatment ID: #${treatmentData.id}</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Patient Information</h3>
              <div class="info-row">
                <span class="info-label">Patient Name:</span>
                <span class="info-value">${treatmentData.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Treatment:</span>
                <span class="info-value">${treatmentData.treatmentType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${statusValue}</span>
              </div>
            </div>
            
            <div class="info-box">
              <h3>Provider Information</h3>
              <div class="info-row">
                <span class="info-label">Dentist:</span>
                <span class="info-value">${dentistInfo ? `Dr. ${dentistInfo.firstName} ${dentistInfo.lastName}` : treatmentData.dentistName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Clinic:</span>
                <span class="info-value">${clinicInfo?.clinicName || treatmentData.clinicName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Printed:</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div class="summary-section">
            <h3 style="font-size: 16px; color: #0d9488; margin-bottom: 15px;">Payment Summary</h3>
            <div class="summary-row">
              <span>Treatment Cost:</span>
              <span>$${treatmentData.totalAmount.toFixed(2)}</span>
            </div>
            ${(treatmentData.treatmentDiscount || 0) > 0 ? `
            <div class="summary-row" style="color: #f97316;">
              <span>Total Discount Applied:</span>
              <span>-$${(treatmentData.treatmentDiscount || 0).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>$${effectiveTotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Amount Paid:</span>
              <span style="color: #10b981;">$${treatmentData.paidAmount.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Balance Due:</span>
              <span style="color: ${remainingBalance > 0 ? '#ef4444' : '#10b981'};">$${remainingBalance.toFixed(2)}</span>
            </div>
          </div>
          
          ${payments && payments.length > 0 ? `
          <h3 style="font-size: 18px; color: #1e293b; margin: 30px 0 15px 0;">Payment History</h3>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Method</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(payment => `
              <tr>
                <td>${new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td style="color: #10b981; font-weight: 600;">$${payment.amount.toFixed(2)}</td>
                <td style="color: ${(payment.discount || 0) > 0 ? '#f97316' : '#6b7280'}; font-weight: ${(payment.discount || 0) > 0 ? '600' : 'normal'};">$${(payment.discount || 0).toFixed(2)}</td>
                <td>${payment.method === 'CASH' ? 'Cash' : 'Card'}</td>
                <td style="color: #6b7280;">${payment.notes || '-'}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}
          
          <div class="footer">
            <p>This is an official treatment receipt. Please retain for your records.</p>
            <p>Thank you for choosing our services.</p>
          </div>
          
          <center>
            <button onclick="window.print()">Print Receipt</button>
          </center>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

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
          {!asFullPage && !readOnly && (
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
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all duration-200
              ${activeTab === 'prescriptions'
                ? 'bg-teal-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Prescriptions
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
                    <TreatmentTeethStatus 
                      teethStatus={treatmentData.teethStatus} 
                      editable={!readOnly}
                      onMarkComplete={!readOnly ? handleMarkToothComplete : undefined}
                    />
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

              {/* Quick Actions - Hidden in read-only mode */}
              {!readOnly && (
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
                      {onCreatePrescription && (
                        <Button
                          variant="outline"
                          onClick={() => onCreatePrescription(treatmentData)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <FaPrescriptionBottle className="w-4 h-4 mr-2" />
                          Create Prescription
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
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {(treatmentData.treatmentDiscount || 0) > 0 && (
                  <Card className={isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-orange-50 to-orange-100'}>
                    <Card.Content className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                            Total Discount
                          </p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-orange-900'}`}>
                            ${(treatmentData.treatmentDiscount || 0).toFixed(2)}
                          </p>
                        </div>
                        <FaDollarSign className={`w-10 h-10 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                      </div>
                    </Card.Content>
                  </Card>
                )}

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
                  ? 'bg-gradient-to-br from-red-50 to-red-100' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100'
                }>
                  <Card.Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' 
                          : remainingBalance > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {remainingBalance > 0 ? 'Balance Due' : 'Fully Paid'}
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' 
                          : remainingBalance > 0 ? 'text-red-900' : 'text-blue-900'}`}>
                          ${remainingBalance.toFixed(2)}
                        </p>
                      </div>
                      <FaDollarSign className={`w-10 h-10 ${isDarkMode 
                        ? remainingBalance > 0 ? 'text-red-400' : 'text-blue-400'
                        : remainingBalance > 0 ? 'text-red-500' : 'text-blue-500'}`} />
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
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Payment History
                    </h3>
                    {payments && payments.length > 0 && (
                      <Button
                        onClick={handlePrintComprehensiveReceipt}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <FaFileInvoiceDollar className="w-4 h-4" />
                        Print Full Receipt
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Content>
                  {payments && payments.length > 0 ? (
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className={`
                        grid grid-cols-7 gap-4 p-3 rounded-lg font-semibold text-sm uppercase tracking-wide
                        ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}
                      `}>
                        <div>DATE</div>
                        <div>PATIENT</div>
                        <div>TREATMENT</div>
                        <div>AMOUNT</div>
                        <div>DISCOUNT</div>
                        <div>METHOD</div>
                        <div>NOTES</div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-2">
                        {payments.map((payment, index) => (
                          <div
                            key={index}
                            className={`
                              grid grid-cols-7 gap-4 p-3 rounded-lg border items-center
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

                            {/* Discount */}
                            <div>
                              <span className={`text-sm font-semibold ${
                                (payment.discount || 0) > 0 
                                  ? 'text-orange-600 dark:text-orange-400' 
                                  : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                ${(payment.discount || 0).toFixed(2)}
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

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <FaPrescriptionBottle className="w-5 h-5 text-blue-600" />
                      Prescription History
                    </h3>
                    {!readOnly && onCreatePrescription && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onCreatePrescription(treatmentData)}
                      >
                        <FaPlus className="w-4 h-4 mr-2" />
                        New Prescription
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Content>
                  {prescriptions && prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((prescription, index) => (
                        <div
                          key={prescription.id || index}
                          className={`p-4 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700/50 border-gray-600'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                              }`}>
                                <FaPrescriptionBottle className="text-blue-600" />
                              </div>
                              <div>
                                <p className={`font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                  Prescription #{index + 1}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className={`w-3 h-3 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`} />
                                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    {new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintPrescription(prescription, index)}
                              className="flex items-center gap-2"
                            >
                              <FaPrint className="w-4 h-4" />
                              Print
                            </Button>
                          </div>

                          {/* Medications List */}
                          <div className="space-y-2">
                            <p className={`text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Medications:
                            </p>
                            {prescription.medications && prescription.medications.map((med, medIndex) => (
                              <div
                                key={medIndex}
                                className={`p-3 rounded border ${
                                  isDarkMode
                                    ? 'bg-gray-800/50 border-gray-600'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <p className={`font-medium mb-1 ${
                                  isDarkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {medIndex + 1}. {med.name}
                                </p>
                                <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {med.dosage && (
                                    <div>
                                      <span className="font-medium">Dosage:</span> {med.dosage}
                                    </div>
                                  )}
                                  {med.frequency && (
                                    <div>
                                      <span className="font-medium">Frequency:</span> {med.frequency}
                                    </div>
                                  )}
                                  {med.duration && (
                                    <div>
                                      <span className="font-medium">Duration:</span> {med.duration}
                                    </div>
                                  )}
                                </div>
                                {med.instructions && (
                                  <p className={`mt-2 text-sm italic ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    <FaStickyNote className="inline w-3 h-3 mr-1" />
                                    {med.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaPrescriptionBottle className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No prescriptions yet
                      </p>
                      <p className={`text-sm mb-4 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Create a prescription to track medications for this treatment
                      </p>
                      {!readOnly && onCreatePrescription && (
                        <Button
                          variant="primary"
                          onClick={() => onCreatePrescription(treatmentData)}
                        >
                          <FaPlus className="w-4 h-4 mr-2" />
                          Create First Prescription
                        </Button>
                      )}
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
    return (
      <>
        {content}
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    )
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

export default TreatmentDetailsModal
