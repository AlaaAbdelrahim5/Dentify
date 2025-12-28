import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaPrescriptionBottle,
  FaPills,
  FaCalendarAlt,
  FaClock,
  FaPrint
} from 'react-icons/fa'
import { Button, Input, Card } from '../../common'
import { getTodayISO } from '../../../utils/helpers'

const PrescriptionModal = ({ isOpen, onClose, onSave, patientInfo, treatmentInfo }) => {
  const { isDarkMode } = useTheme()
  const [medications, setMedications] = useState([
    { 
      id: 1, 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '' 
    }
  ])
  const [prescriptionDate, setPrescriptionDate] = useState(getTodayISO())
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setMedications([
        { 
          id: 1, 
          name: '', 
          dosage: '', 
          frequency: '', 
          duration: '', 
          instructions: '' 
        }
      ])
      setPrescriptionDate(getTodayISO())
      setNotes('')
    }
  }, [isOpen])

  const handleAddMedication = () => {
    const newId = Math.max(...medications.map(m => m.id), 0) + 1
    setMedications([
      ...medications,
      { 
        id: newId, 
        name: '', 
        dosage: '', 
        frequency: '', 
        duration: '', 
        instructions: '' 
      }
    ])
  }

  const handleRemoveMedication = (id) => {
    if (medications.length > 1) {
      setMedications(medications.filter(m => m.id !== id))
    }
  }

  const handleMedicationChange = (id, field, value) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form
    const validMedications = medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      alert('Please add at least one medication')
      return
    }

    const prescriptionData = {
      patientId: patientInfo?.id,
      patientName: patientInfo?.name,
      treatmentId: treatmentInfo?.id,
      treatmentName: treatmentInfo?.treatmentName,
      prescriptionDate,
      medications: validMedications,
      notes
    }

    onSave(prescriptionData)
  }

  const handlePrint = () => {
    // Generate prescription preview for printing
    const printWindow = window.open('', '_blank')
    const printContent = generatePrintContent()
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const generatePrintContent = () => {
    const validMedications = medications.filter(m => m.name.trim())
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patientInfo?.name}</title>
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
          .notes {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .notes h3 {
            margin: 0 0 10px 0;
            color: #856404;
          }
          .notes p {
            margin: 0;
            color: #856404;
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
        </div>

        <div class="patient-info">
          <div><strong>Patient Name:</strong> ${patientInfo?.name || 'N/A'}</div>
          <div><strong>Treatment:</strong> ${treatmentInfo?.treatmentName || 'N/A'}</div>
          <div><strong>Date:</strong> ${new Date(prescriptionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>

        <div class="medications">
          <h2>💊 Medications</h2>
          ${validMedications.map((med, index) => `
            <div class="medication">
              <h3>${index + 1}. ${med.name}</h3>
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

        ${notes ? `
          <div class="notes">
            <h3>⚠️ Additional Notes</h3>
            <p>${notes}</p>
          </div>
        ` : ''}

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
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
            }`}>
              <FaPrescriptionBottle className="text-teal-600 text-xl" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Create Prescription
              </h2>
              {patientInfo && (
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  For {patientInfo.name}
                </p>
              )}
            </div>
          </div>
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient & Treatment Info */}
          <Card className={`p-4 ${
            isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Patient:
                </span>
                <p className={`mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {patientInfo?.name || 'N/A'}
                </p>
              </div>
              <div>
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Treatment:
                </span>
                <p className={`mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {treatmentInfo?.treatmentName || 'N/A'}
                </p>
              </div>
              <div>
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Date:
                </span>
                <p className={`mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <FaPills className="text-teal-600" />
                Medications
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMedication}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <Card key={medication.id} className={`p-4 ${
                  isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Medication {index + 1}
                    </h4>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(medication.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Medication Name *"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(medication.id, 'name', e.target.value)}
                        placeholder="e.g., Amoxicillin, Ibuprofen"
                        required
                      />
                    </div>

                    <Input
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(medication.id, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg, 2 tablets"
                    />

                    <Input
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(medication.id, 'frequency', e.target.value)}
                      placeholder="e.g., 3 times daily, Every 8 hours"
                    />

                    <Input
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(medication.id, 'duration', e.target.value)}
                      placeholder="e.g., 7 days, 2 weeks"
                    />

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Special Instructions
                      </label>
                      <textarea
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(medication.id, 'instructions', e.target.value)}
                        placeholder="e.g., Take after meals, Avoid alcohol"
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg resize-none ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
            >
              <FaPrint className="w-4 h-4 mr-2" />
              Preview & Print
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <FaPrescriptionBottle className="w-4 h-4 mr-2" />
              Save Prescription
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrescriptionModal
