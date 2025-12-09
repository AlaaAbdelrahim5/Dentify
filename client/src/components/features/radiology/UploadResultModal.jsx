import { useState, useRef } from 'react'
import { FaFileUpload, FaTimes, FaCalendarAlt, FaImage, FaFilePdf, FaFileAlt, FaCloudUploadAlt, FaLink, FaCheckCircle } from 'react-icons/fa'
import { Button, Input } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const UploadResultModal = ({ request, isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme()
  const [uploadMode, setUploadMode] = useState('file') // 'file' or 'url'
  const [formData, setFormData] = useState({
    reportFile: '',
    notes: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen || !request) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid file (JPEG, PNG, GIF, WebP, or PDF)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (uploadMode === 'file' && !selectedFile) {
      setError('Please select a file to upload')
      return
    }

    if (uploadMode === 'url' && !formData.reportFile) {
      setError('Please provide a valid URL')
      return
    }

    setIsSubmitting(true)

    try {
      let reportFileData = formData.reportFile

      // If a file was selected, convert it to base64
      if (uploadMode === 'file' && selectedFile) {
        const reader = new FileReader()
        reportFileData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
      }

      const token = authUtils.getAccessToken()
      
      const response = await fetch(`http://localhost:5000/api/radiology-requests/${request.id}/upload-result`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportFile: reportFileData,
          availableDate: new Date().toISOString(), // Set to current date/time
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

  const getFileIcon = () => {
    if (!selectedFile) return <FaFileAlt />
    if (selectedFile.type.startsWith('image/')) return <FaImage />
    if (selectedFile.type === 'application/pdf') return <FaFilePdf />
    return <FaFileAlt />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal panel - centered and properly sized */}
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        {/* Header with gradient */}
        <div className={`sticky top-0 z-10 overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        }`}>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <FaCloudUploadAlt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Upload Radiology Result</h3>
                  <p className="text-blue-100 text-sm">Request #{request.id} - {request.imagingType}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-500 text-red-200' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              <FaTimes className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Patient Info Card */}
          <div className={`p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold text-sm">
                  {request.patient?.firstName?.[0]}{request.patient?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {request.patient?.firstName} {request.patient?.lastName}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Patient Information
                </p>
              </div>
            </div>
          </div>

          {/* Upload Mode Toggle */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file')
                  setFormData(prev => ({ ...prev, reportFile: '' }))
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  uploadMode === 'file'
                    ? isDarkMode
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-blue-500 bg-blue-50'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <FaCloudUploadAlt className={`w-6 h-6 mx-auto mb-2 ${
                  uploadMode === 'file' 
                    ? 'text-blue-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`font-medium text-sm ${
                  uploadMode === 'file'
                    ? 'text-blue-500'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Upload File
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Images or PDF
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url')
                  setSelectedFile(null)
                  setFilePreview(null)
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  uploadMode === 'url'
                    ? isDarkMode
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-blue-500 bg-blue-50'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <FaLink className={`w-6 h-6 mx-auto mb-2 ${
                  uploadMode === 'url' 
                    ? 'text-blue-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`font-medium text-sm ${
                  uploadMode === 'url'
                    ? 'text-blue-500'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Use URL
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  External link
                </p>
              </button>
            </div>
          </div>

          {/* File Upload Area - Only show when uploadMode is 'file' */}
          {uploadMode === 'file' && (
            <div>
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Report File <span className="text-red-500">*</span>
              </label>
              
              <div 
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? isDarkMode 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-green-500 bg-green-50'
                    : isDarkMode 
                      ? 'border-gray-600 hover:border-blue-500 bg-gray-700/30 hover:bg-gray-700/50' 
                      : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50'
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    {filePreview && (
                      <div className="relative inline-block">
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="max-h-40 mx-auto rounded-lg object-contain shadow-lg"
                        />
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-green-500' : 'bg-green-500'
                        }`}>
                          <FaCheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                    {!filePreview && (
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
                        isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FaFilePdf className="w-10 h-10 text-blue-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getFileIcon()}
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedFile.name}
                        </span>
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        setFilePreview(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="mt-2"
                    >
                      <FaTimes className="mr-2" /> Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <FaCloudUploadAlt className={`w-8 h-8 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Click to upload or drag and drop
                      </p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        JPEG, PNG, GIF, WebP or PDF (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* URL Input - Only show when uploadMode is 'url' */}
          {uploadMode === 'url' && (
            <div>
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Report File URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLink className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                </div>
                <input
                  type="url"
                  name="reportFile"
                  value={formData.reportFile}
                  onChange={handleChange}
                  placeholder="https://example.com/report.pdf"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  }`}
                />
              </div>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Enter the complete URL to the radiology report file
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Add any relevant notes about the results, findings, or recommendations..."
              className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Footer with gradient buttons */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaCloudUploadAlt className="w-5 h-5" />
                  Upload Result
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadResultModal
