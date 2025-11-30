import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa'
import { Button, Input } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'

const SessionCostModal = ({ isOpen, onClose, onSave, appointmentInfo }) => {
  const { isDarkMode } = useTheme()
  const [sessionCost, setSessionCost] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!sessionCost || parseFloat(sessionCost) <= 0) {
      setError('Please enter a valid session cost')
      return
    }

    try {
      setLoading(true)
      await onSave(parseFloat(sessionCost))
      handleClose()
    } catch (err) {
      console.error('Error saving session cost:', err)
      setError('Failed to complete appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSessionCost('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-md transform transition-all ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Complete Appointment
              </h2>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {appointmentInfo && (
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Patient: <span className="font-semibold">{appointmentInfo.patientName}</span>
                  </p>
                  {appointmentInfo.treatment && (
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Treatment: <span className="font-semibold">{appointmentInfo.treatment}</span>
                    </p>
                  )}
                  {!appointmentInfo.treatment && (
                    <p className={`text-xs mt-2 text-yellow-600 dark:text-yellow-400`}>
                      Note: This appointment is not linked to a treatment
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Session Cost
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    $
                  </span>
                  <input
                    type="number"
                    value={sessionCost}
                    onChange={(e) => {
                      setSessionCost(e.target.value)
                      setError('')
                    }}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors text-lg ${
                      error
                        ? 'border-red-500 focus:ring-red-500'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-teal-500'
                    }`}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                <p className={`text-xs mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  This cost will be added to the treatment's total amount
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !sessionCost}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {loading ? 'Completing...' : 'Complete Appointment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SessionCostModal
