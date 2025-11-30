import { useState } from 'react'
import { FaFileUpload, FaTimes, FaCalendarAlt } from 'react-icons/fa'
import { Button, Input } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const UploadResultModal = ({ request, isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    reportFile: '',
    availableDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !request) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.reportFile) {
      setError('Please provide a report file URL')
      return
    }

    setIsSubmitting(true)

    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`http://localhost:5000/api/radiology-requests/${request.id}/upload-result`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportFile: formData.reportFile,
          availableDate: new Date(formData.availableDate).toISOString(),
          status: 'COMPLETED',
          notes: formData.notes
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to upload result')
      }
    } catch (error) {
      console.error('Error uploading result:', error)
      setError('An error occurred while uploading the result')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaFileUpload className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                Upload Result
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Request Info */}
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Request #{request.id} - {request.imagingType}
              </p>
              <p className="font-semibold mt-1">
                {request.patient?.firstName} {request.patient?.lastName}
              </p>
            </div>

            {/* Report File URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Report File URL <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                name="reportFile"
                value={formData.reportFile}
                onChange={handleChange}
                placeholder="https://example.com/report.pdf"
                required
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter the URL where the report file can be accessed
              </p>
            </div>

            {/* Available Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="availableDate"
                value={formData.availableDate}
                onChange={handleChange}
                icon={FaCalendarAlt}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information about the results..."
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Result'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadResultModal
