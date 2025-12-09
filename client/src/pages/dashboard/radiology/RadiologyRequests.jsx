import { useState, useEffect, useMemo } from 'react'
import { 
  FaEye,
  FaFileUpload,
  FaDownload,
  FaUser,
  FaCalendarAlt,
  FaXRay,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaExclamationCircle,
  FaBan,
  FaHospital,
  FaStethoscope,
  FaTh,
  FaListAlt,
  FaCheck,
  FaEdit,
  FaLink
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { 
  Card, 
  Button, 
  StatsOverview, 
  DataTable, 
  StatusBadge, 
  Select, 
  Input, 
  FilterBar, 
  Pagination,
  PageHeader,
  LoadingSpinner,
  RequestDetailsModal,
  UploadResultModal
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const RadiologyRequests = ({ radiologyData, onStatsUpdate }) => {
  const { isDarkMode } = useTheme()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedImagingType, setSelectedImagingType] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('table') // table or grid

  // Check if reportFile is a URL (not base64)
  const isReportFileUrl = (reportFile) => {
    if (!reportFile) return false
    try {
      // Try parsing as JSON array first
      const parsed = JSON.parse(reportFile)
      if (Array.isArray(parsed)) return false // It's a file array
    } catch (e) {
      // Not JSON, continue checking
    }
    // Check if it's a URL
    return reportFile.startsWith('http://') || reportFile.startsWith('https://')
  }

  const handleDownloadReport = (reportFile) => {
    if (!reportFile) return

    // Helper function to download a single file
    const downloadSingleFile = (fileData, index = 0) => {
      // Check if it's a base64 data URI
      if (fileData.startsWith('data:')) {
        // Extract the MIME type and base64 data
        const matches = fileData.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          const mimeType = matches[1]
          const base64Data = matches[2]
          
          // Convert base64 to blob
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: mimeType })
          
          // Create download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          
          // Determine file extension from MIME type
          const extension = mimeType.includes('pdf') ? 'pdf' : mimeType.split('/')[1] || 'jpg'
          const fileName = index > 0 
            ? `radiology-report-${index + 1}-${Date.now()}.${extension}`
            : `radiology-report-${Date.now()}.${extension}`
          link.download = fileName
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      } else {
        // If it's a URL, open in new tab (let browser handle download)
        window.open(fileData, '_blank')
      }
    }

    // Try to parse as JSON array (multiple files)
    try {
      const filesArray = JSON.parse(reportFile)
      if (Array.isArray(filesArray)) {
        // Download each file with a slight delay to prevent browser blocking
        filesArray.forEach((file, index) => {
          setTimeout(() => {
            downloadSingleFile(file, index)
          }, index * 200) // 200ms delay between downloads
        })
        return
      }
    } catch (e) {
      // Not JSON, treat as single file
    }

    // Download as single file
    downloadSingleFile(reportFile)
  }

  // Fetch requests
  useEffect(() => {
    fetchRequests()
  }, [])

  // Filter requests - use useMemo for performance
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.dentist?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.dentist?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.imagingType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
      const matchesImagingType = selectedImagingType === 'all' || 
                                 request.imagingType?.trim() === selectedImagingType.trim()
      
      return matchesSearch && matchesStatus && matchesImagingType
    })
  }, [requests, searchTerm, selectedStatus, selectedImagingType])

  // Calculate stats - use useMemo for performance
  const stats = useMemo(() => {
    const total = requests.length
    const requested = requests.filter(r => r.status === 'REQUESTED').length
    const inProgress = requests.filter(r => r.status === 'IN_PROGRESS').length
    const completed = requests.filter(r => r.status === 'COMPLETED').length
    
    return { total, requested, inProgress, completed }
  }, [requests])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/radiology-requests/center/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched radiology requests:', data)
        setRequests(data.radiologyRequests || data.data || data.requests || [])
      } else {
        console.error('Failed to fetch requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setIsDetailsModalOpen(true)
  }

  const handleUploadResult = (request) => {
    setSelectedRequest(request)
    setIsUploadModalOpen(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <FaClock className="w-4 h-4" />
      case 'IN_PROGRESS':
        return <FaExclamationCircle className="w-4 h-4" />
      case 'COMPLETED':
        return <FaCheck className="w-4 h-4" />
      case 'CANCELLED':
        return <FaBan className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' 
          : 'bg-yellow-100 text-yellow-700 border-yellow-400'
      case 'IN_PROGRESS':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'COMPLETED':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'CANCELLED':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      default:
        return isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-600' 
          : 'bg-white text-gray-700 border-gray-300'
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'REQUESTED': 'Requested',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    }
    return statusMap[status] || status
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`http://localhost:5000/api/radiology-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        await fetchRequests()
        if (onStatsUpdate) {
          onStatsUpdate()
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const RequestCard = ({ request }) => (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <FaXRay className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {request.imagingType}
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {request.patient?.firstName} {request.patient?.lastName}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${
          getStatusColor(request.status)
        }`}>
          {getStatusIcon(request.status)}
          {getStatusLabel(request.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FaStethoscope className="text-gray-500 w-4 h-4" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Dr. {request.dentist?.firstName} {request.dentist?.lastName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-gray-500 w-4 h-4" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Requested: {formatDate(request.requestDate)}
          </span>
        </div>
        {request.availableDate && (
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-teal-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-teal-400' : 'text-teal-600'}>
              Available: {formatDate(request.availableDate)}
            </span>
          </div>
        )}
        {request.notes && (
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {request.notes}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewDetails(request)}
          title="View Details"
          className="text-blue-600"
        >
          <FaEye className="w-4 h-4" />
        </Button>
        {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUploadResult(request)}
            title="Upload Result"
            className="text-green-600"
          >
            <FaFileUpload className="w-4 h-4" />
          </Button>
        )}
        {request.status === 'COMPLETED' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUploadResult(request)}
            title="Update Result"
            className="text-orange-600"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
        )}
        {request.reportFile && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-purple-600"
            onClick={() => handleDownloadReport(request.reportFile)}
            title={isReportFileUrl(request.reportFile) ? "View Report" : "Download Report"}
          >
            {isReportFileUrl(request.reportFile) ? (
              <FaLink className="w-4 h-4" />
            ) : (
              <FaDownload className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className={`mt-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Loading radiology requests...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Imaging Requests
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage and process radiology imaging requests
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={[
        { 
          label: 'Total Requests', 
          value: stats.total, 
          icon: FaXRay, 
          gradient: 'from-blue-600 to-cyan-600' 
        },
        { 
          label: 'Requested', 
          value: stats.requested, 
          icon: MdPendingActions, 
          gradient: 'from-yellow-600 to-orange-600' 
        },
        { 
          label: 'In Progress', 
          value: stats.inProgress, 
          icon: FaClock, 
          gradient: 'from-blue-600 to-indigo-600' 
        },
        { 
          label: 'Completed', 
          value: stats.completed, 
          icon: FaCheckCircle, 
          gradient: 'from-green-600 to-teal-600' 
        }
      ]} />

      {/* Filters and View Mode */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              searchPlaceholder="Search by patient name, dentist, or imaging type..."
              filters={[
                {
                  value: selectedStatus,
                  onChange: (e) => setSelectedStatus(e.target.value),
                  options: [
                    { value: 'all', label: 'All Status' },
                    { value: 'REQUESTED', label: 'Requested' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' }
                  ],
                  placeholder: 'Filter by status'
                },
                {
                  value: selectedImagingType,
                  onChange: (e) => setSelectedImagingType(e.target.value),
                  options: [
                    { value: 'all', label: 'All Types' },
                    { value: 'X-Ray', label: 'X-Ray' },
                    { value: 'Panoramic X-Ray', label: 'Panoramic X-Ray' },
                    { value: 'CBCT', label: 'CBCT' },
                    { value: 'CT', label: 'CT' },
                    { value: '3D Imaging', label: '3D Imaging' },
                    { value: 'Periapical', label: 'Periapical' },
                    { value: 'Bitewing', label: 'Bitewing' }
                  ],
                  placeholder: 'Filter by type'
                }
              ]}
              onClearFilters={() => {
                setSearchTerm('')
                setSelectedStatus('all')
                setSelectedImagingType('all')
              }}
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <FaListAlt className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaTh className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Requests - Table or Grid View */}
      {filteredRequests.length === 0 ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaXRay className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {requests.length === 0 ? 'No radiology requests yet' : 'No requests match your filters'}
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {requests.length === 0 
              ? 'Waiting for dentists to submit imaging requests'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <DataTable
                columns={[
                  {
                    label: 'Patient',
                    accessor: 'patient',
                    render: (value, row) => (
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500 w-4 h-4" />
                        <span className="font-medium">
                          {row.patient?.firstName} {row.patient?.lastName}
                        </span>
                      </div>
                    )
                  },
                  {
                    label: 'Dentist',
                    accessor: 'dentist',
                    render: (value, row) => (
                      <span>Dr. {row.dentist?.firstName} {row.dentist?.lastName}</span>
                    )
                  },
                  {
                    label: 'Imaging Type',
                    accessor: 'imagingType',
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <FaXRay className="text-blue-500 w-4 h-4" />
                        <span>{value}</span>
                      </div>
                    )
                  },
                  {
                    label: 'Request Date',
                    accessor: 'requestDate',
                    render: (value) => formatDate(value)
                  },
                  {
                    label: 'Available Date',
                    accessor: 'availableDate',
                    render: (value) => value ? (
                      <div className="flex items-center gap-2 text-teal-500">
                        <FaClock className="w-4 h-4" />
                        <span>{formatDate(value)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )
                  },
                  {
                    label: 'Status',
                    accessor: 'status',
                    render: (value) => (
                      <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 w-fit ${
                        getStatusColor(value)
                      }`}>
                        {getStatusIcon(value)}
                        {getStatusLabel(value)}
                      </span>
                    )
                  },
                  {
                    label: 'Actions',
                    accessor: 'id',
                    render: (value, row) => (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(row)}
                          title="View Details"
                          className="text-blue-600"
                        >
                          <FaEye className="w-4 h-4" />
                        </Button>
                        {row.status !== 'COMPLETED' && row.status !== 'CANCELLED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUploadResult(row)}
                            title="Upload Result"
                            className="text-green-600"
                          >
                            <FaFileUpload className="w-4 h-4" />
                          </Button>
                        )}
                        {row.status === 'COMPLETED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUploadResult(row)}
                            title="Update Result"
                            className="text-orange-600"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Button>
                        )}
                        {row.reportFile && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-purple-600"
                            onClick={() => handleDownloadReport(row.reportFile)}
                            title={isReportFileUrl(row.reportFile) ? "View Report" : "Download Report"}
                          >
                            {isReportFileUrl(row.reportFile) ? (
                              <FaLink className="w-4 h-4" />
                            ) : (
                              <FaDownload className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  }
                ]}
                data={filteredRequests}
                emptyMessage="No radiology requests found"
              />
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      {isDetailsModalOpen && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedRequest(null)
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {isUploadModalOpen && selectedRequest && (
        <UploadResultModal
          request={selectedRequest}
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false)
            setSelectedRequest(null)
          }}
          onSuccess={() => {
            fetchRequests()
            if (onStatsUpdate) {
              onStatsUpdate()
            }
          }}
        />
      )}
    </div>
  )
}

export default RadiologyRequests
