import { useState, useEffect, useMemo } from 'react'
import { 
  FaXRay, 
  FaCalendarAlt, 
  FaStethoscope, 
  FaEye, 
  FaDownload, 
  FaCheckCircle, 
  FaClock, 
  FaListAlt,
  FaTh,
  FaFileAlt,
  FaHospital,
  FaLink
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { 
  Card, 
  Button, 
  FilterBar, 
  DataTable, 
  StatsOverview,
  RequestCard,
  LoadingSpinner,
  EmptyState
} from '../../../components'
import ImageViewerModal from '../../../components/features/radiology/ImageViewerModal'
import { useTheme } from '../../../contexts/ThemeContext'
import { patientsAPI } from '../../../services/api'
import { formatDate as formatDateHelper, getStatusColor } from '../../../utils/helpers'

const PatientXRayResults = () => {
  const { isDarkMode } = useTheme()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedImagingType, setSelectedImagingType] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [viewMode, setViewMode] = useState('table') // table or grid

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchXRayRequests(true)
    }
  }, [searchTerm, selectedStatus, selectedImagingType])

  // Initial load
  useEffect(() => {
    fetchXRayRequests()
  }, [])

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
            ? `xray-report-${index + 1}-${Date.now()}.${extension}`
            : `xray-report-${Date.now()}.${extension}`
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

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.dentist?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.dentist?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.radiologyCenter?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.imagingType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
      const matchesType = selectedImagingType === 'all' || request.imagingType === selectedImagingType
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [requests, searchTerm, selectedStatus, selectedImagingType])

  // Calculate stats
  const stats = useMemo(() => {
    if (isLoading) {
      return { total: 0, requested: 0, inProgress: 0, completed: 0 }
    }
    const total = requests.length
    const requested = requests.filter(r => r.status === 'REQUESTED').length
    const inProgress = requests.filter(r => r.status === 'IN_PROGRESS').length
    const completed = requests.filter(r => r.status === 'COMPLETED').length
    
    return { total, requested, inProgress, completed }
  }, [requests, isLoading])

  const fetchXRayRequests = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setIsLoading(true)
      }
      const response = await patientsAPI.getMyRadiologyRequests()
      setRequests(response.data || [])
    } catch (error) {
      console.error('Error fetching X-ray requests:', error)
      setRequests([])
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setIsLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  const handleViewImages = (request) => {
    setSelectedRequest(request)
    setIsImageViewerOpen(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <MdPendingActions className="w-3 h-3" />
      case 'IN_PROGRESS':
        return <FaClock className="w-3 h-3" />
      case 'COMPLETED':
        return <FaCheckCircle className="w-3 h-3" />
      default:
        return null
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            X-ray Results
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            View and download your radiology imaging results
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={[
        { 
          label: 'Total Requests', 
          value: isLoading ? '-' : stats.total, 
          icon: FaXRay, 
          gradient: 'from-blue-600 to-cyan-600' 
        },
        { 
          label: 'Requested', 
          value: isLoading ? '-' : stats.requested, 
          icon: MdPendingActions, 
          gradient: 'from-yellow-600 to-orange-600' 
        },
        { 
          label: 'In Progress', 
          value: isLoading ? '-' : stats.inProgress, 
          icon: FaClock, 
          gradient: 'from-blue-600 to-indigo-600' 
        },
        { 
          label: 'Completed', 
          value: isLoading ? '-' : stats.completed, 
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
              searchPlaceholder="Search by dentist, radiology center, or imaging type..."
              filtering={filtering}
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
      {isLoading || filtering ? (
        <Card className="p-8 text-center">
          <LoadingSpinner size="lg" text={isLoading ? "Loading X-ray requests..." : "Filtering results..."} />
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaXRay}
            title={requests.length === 0 ? 'No X-ray requests yet' : 'No requests match your filters'}
            description={requests.length === 0 
              ? 'Your dentist will request X-rays when needed for your treatment'
              : 'Try adjusting your search or filter criteria'}
          />
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  variant="patient"
                  onViewImages={request.reportFile ? handleViewImages : null}
                  onDownload={request.reportFile ? (req) => handleDownloadReport(req.reportFile) : null}
                />
              ))}
            </div>
          ) : (
            <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <DataTable
                loading={isLoading || filtering}
                columns={[
                  {
                    label: 'Imaging Type',
                    accessor: 'imagingType',
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <FaXRay className="text-blue-500 w-4 h-4" />
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  },
                  {
                    label: 'Dentist',
                    accessor: 'dentist',
                    render: (value, row) => (
                      <div className="flex items-center gap-2">
                        <FaStethoscope className="text-teal-500 w-4 h-4" />
                        <span>Dr. {row.dentist?.firstName} {row.dentist?.lastName}</span>
                      </div>
                    )
                  },
                  {
                    label: 'Radiology Center',
                    accessor: 'radiologyCenter',
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <FaHospital className="text-teal-500 w-4 h-4" />
                        <span className={value?.centerName ? '' : 'text-gray-500 italic'}>
                          {value?.centerName || 'Not assigned yet'}
                        </span>
                      </div>
                    )
                  },
                  {
                    label: 'Request Date',
                    accessor: 'requestDate',
                    render: (value) => formatDateHelper(value)
                  },
                  {
                    label: 'Available Date',
                    accessor: 'availableDate',
                    render: (value) => value ? (
                      <div className="flex items-center gap-2 text-teal-500">
                        <FaClock className="w-4 h-4" />
                        <span>{formatDateHelper(value)}</span>
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
                        getStatusColor(value, isDarkMode)
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
                        {row.reportFile && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewImages(row)}
                              title="View Images"
                              className="text-teal-600"
                            >
                              <FaEye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReport(row.reportFile)}
                              title={isReportFileUrl(row.reportFile) ? "View Report" : "Download Report"}
                              className="text-purple-600"
                            >
                              {isReportFileUrl(row.reportFile) ? (
                                <FaLink className="w-4 h-4" />
                              ) : (
                                <FaDownload className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                        {!row.reportFile && row.status === 'COMPLETED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                            title="No images available"
                            className="text-gray-400"
                          >
                            <FaEye className="w-4 h-4" />
                          </Button>
                        )}
                        {row.status !== 'COMPLETED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                          >
                            <FaClock className="w-4 h-4 mr-1" />
                            Pending
                          </Button>
                        )}
                      </div>
                    )
                  }
                ]}
                data={filteredRequests}
                emptyMessage="No X-ray requests found"
              />
            </Card>
          )}
        </>
      )}

      {isImageViewerOpen && selectedRequest && selectedRequest.reportFile && (
        <ImageViewerModal
          isOpen={isImageViewerOpen}
          onClose={() => {
            setIsImageViewerOpen(false)
            setSelectedRequest(null)
          }}
          images={selectedRequest.reportFile}
          patientName={`${selectedRequest.patient?.firstName || ''} ${selectedRequest.patient?.lastName || ''}`.trim()}
        />
      )}
    </div>
  )
}

export default PatientXRayResults
