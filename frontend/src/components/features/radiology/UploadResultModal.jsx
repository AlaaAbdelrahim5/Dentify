import { useState, useRef, useEffect } from 'react'
import { FaFileUpload, FaTimes, FaCalendarAlt, FaImage, FaFilePdf, FaFileAlt, FaCloudUploadAlt, FaLink, FaCheckCircle } from 'react-icons/fa'
import { Button, Input, LoadingSpinner, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const UploadResultModal = ({ request, isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme()
  const [uploadMode, setUploadMode] = useState('file') // 'file' or 'url'
  const [formData, setFormData] = useState({
    reportFile: '',
    notes: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen || !request) return null

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && request) {
      // If request has existing reportFile and notes, populate them
      if (request.reportFile) {
        // Try to parse as JSON array (multiple files)
        try {
          const filesArray = JSON.parse(request.reportFile)
          if (Array.isArray(filesArray) && filesArray.length > 0) {
            // Multiple files stored as JSON array
            setUploadMode('file')
            setFilePreviews(filesArray)
            
            // Create fake file objects for display purposes
            const fakeFiles = filesArray.map((fileData, index) => {
              const mimeType = fileData.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
              const isImage = mimeType.startsWith('image/')
              const isPdf = mimeType === 'application/pdf'
              const isDicom = mimeType.includes('dicom') || mimeType.includes('octet-stream')
              
              let extension = 'jpg'
              if (isPdf) extension = 'pdf'
              else if (isDicom) extension = 'dcm'
              else if (mimeType.includes('png')) extension = 'png'
              else if (mimeType.includes('gif')) extension = 'gif'
              else if (mimeType.includes('webp')) extension = 'webp'
              else if (mimeType.includes('bmp')) extension = 'bmp'
              else if (mimeType.includes('tiff')) extension = 'tiff'
              
              return {
                name: `existing-report-${index + 1}.${extension}`,
                type: mimeType,
                size: 0 // We don't know the actual size
              }
            })
            setSelectedFiles(fakeFiles)
            return
          }
        } catch (e) {
          // Not a JSON array, continue with single file handling
        }
        
        // Check if it's a single base64 file or URL
        if (request.reportFile.startsWith('data:')) {
          // It's a single base64 file
          setUploadMode('file')
          setFilePreviews([request.reportFile])
          // Create a fake file object for display purposes
          const mimeType = request.reportFile.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
          const isImage = mimeType.startsWith('image/')
          const isPdf = mimeType === 'application/pdf'
          const isDicom = mimeType.includes('dicom') || mimeType.includes('octet-stream')
          
          let extension = 'jpg'
          if (isPdf) extension = 'pdf'
          else if (isDicom) extension = 'dcm'
          else if (isImage) {
            if (mimeType.includes('png')) extension = 'png'
            else if (mimeType.includes('gif')) extension = 'gif'
            else if (mimeType.includes('webp')) extension = 'webp'
            else if (mimeType.includes('bmp')) extension = 'bmp'
            else if (mimeType.includes('tiff')) extension = 'tiff'
          }
          
          setSelectedFiles([{
            name: `existing-report.${extension}`,
            type: mimeType,
            size: 0 // We don't know the actual size
          }])
        } else if (request.reportFile.startsWith('http://') || request.reportFile.startsWith('https://')) {
          // It's a URL
          setUploadMode('url')
          setFormData(prev => ({ ...prev, reportFile: request.reportFile }))
        } else {
          // Unknown format, default to URL mode
          setUploadMode('url')
          setFormData(prev => ({ ...prev, reportFile: request.reportFile }))
        }
      }
      
      if (request.notes) {
        setFormData(prev => ({ ...prev, notes: request.notes }))
      }
    } else {
      // Reset form when modal closes
      setUploadMode('file')
      setFormData({ reportFile: '', notes: '' })
      setSelectedFiles([])
      setFilePreviews([])
      setError('')
    }
  }, [isOpen, request])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    processFiles(files)
  }

  const processFiles = (files) => {
    const validFiles = []
    const previews = []
    let hasError = false

    for (const file of files) {
      // Validate file type (images, PDFs, and DICOM)
      const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/x-tiff',
        'application/pdf',
        'application/dicom',
        'application/x-dicom',
        '.dcm',
        '.dicom'
      ]
      
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const isValidType = allowedTypes.includes(file.type) || 
                         ['dcm', 'dicom', 'tiff', 'tif', 'bmp'].includes(fileExtension)
      
      if (!isValidType) {
        setError('Please upload valid files (JPEG, PNG, GIF, WebP, BMP, TIFF, DICOM, or PDF)')
        hasError = true
        continue
      }

      // Validate file size (50MB limit for medical images)
      if (file.size > 50 * 1024 * 1024) {
        setError('Each file must be less than 50MB')
        hasError = true
        continue
      }

      validFiles.push(file)
    }

    if (!hasError) {
      setError('')
    }

    if (validFiles.length === 0) return

    setSelectedFiles(prev => [...prev, ...validFiles])

    // Create previews for images
    validFiles.forEach(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const isImageType = file.type.startsWith('image/') && 
                         !['application/dicom', 'application/x-dicom'].includes(file.type) &&
                         !['dcm', 'dicom'].includes(fileExtension)
      
      if (isImageType) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreviews(prev => [...prev, reader.result])
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreviews(prev => [...prev, null])
      }
    })
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setFilePreviews(prev => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files || [])
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (uploadMode === 'file' && selectedFiles.length === 0) {
      setError('Please select at least one file to upload')
      return
    }

    if (uploadMode === 'url' && !formData.reportFile) {
      setError('Please provide a valid URL')
      return
    }

    setIsSubmitting(true)

    try {
      let reportFileData = formData.reportFile

      // If files were selected, convert them to base64 array
      if (uploadMode === 'file' && selectedFiles.length > 0) {
        const base64Files = await Promise.all(
          selectedFiles.map((file, index) => {
            // If we have a preview already (existing file), use it
            if (filePreviews[index] && filePreviews[index].startsWith('data:')) {
              return Promise.resolve(filePreviews[index])
            }
            // Otherwise, read the new file
            return new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
          })
        )
        // Store as JSON array of base64 strings
        reportFileData = JSON.stringify(base64Files)
      }

      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/radiology-requests/${request.id}/upload-result`, {
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

  const getFileIcon = (file) => {
    if (!file) return <FaFileAlt />
    if (file.type.startsWith('image/')) return <FaImage />
    if (file.type === 'application/pdf') return <FaFilePdf />
    return <FaFileAlt />
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Upload Radiology Result"
      noPadding
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
        {/* Fixed Top Section */}
        <div className="flex-shrink-0 p-6 pb-4 space-y-4">
          {/* Request Info */}
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Request #{request.id} - {request.imagingType}
            </p>
          </div>
          {error && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-500 text-red-200' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              <FaTimes className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-6 space-y-5">

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
                Report Files <span className="text-red-500">*</span>
              </label>
              
              <div 
                onClick={() => selectedFiles.length === 0 && fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? isDarkMode
                      ? 'border-blue-500 bg-blue-500/20 scale-105'
                      : 'border-blue-500 bg-blue-100 scale-105'
                    : selectedFiles.length > 0
                    ? isDarkMode 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-green-500 bg-green-50'
                    : isDarkMode 
                      ? 'border-gray-600 hover:border-blue-500 bg-gray-700/30 hover:bg-gray-700/50' 
                      : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50'
                }`}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-4">
                    {/* Display all selected files */}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className={`relative p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          {filePreviews[index] ? (
                            <div className="relative">
                              <img 
                                src={filePreviews[index]} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg shadow"
                              />
                              <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center bg-green-500`}>
                                <FaCheckCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className={`flex items-center justify-center h-32 rounded-lg ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                            }`}>
                              <FaFilePdf className="w-12 h-12 text-blue-500" />
                            </div>
                          )}
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-1">
                              {getFileIcon(file)}
                              <span className={`text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {file.name}
                              </span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Existing file'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(index)
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                              isDarkMode 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-red-500 hover:bg-red-600'
                            } text-white`}
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add more files button */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="mt-2"
                    >
                      <FaCloudUploadAlt className="mr-2" /> Add More Files
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
                        Medical images (JPEG, PNG, TIFF, BMP, DICOM) or PDF (Max 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/x-tiff,application/pdf,application/dicom,application/x-dicom,.dcm,.dicom,.tif,.tiff"
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
              <Input
                type="url"
                name="reportFile"
                value={formData.reportFile}
                onChange={handleChange}
                placeholder="https://example.com/report.pdf"
                icon={FaLink}
                required
              />
              {formData.reportFile && (
                <div className={`mt-3 p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                    }`}>
                      <FaLink className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        External Link
                      </p>
                      <p className={`text-xs break-all ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formData.reportFile}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
        </div>

        {/* Fixed Bottom Section */}
        <div className={`flex justify-end gap-3 p-6 pt-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Result'}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}

export default UploadResultModal
