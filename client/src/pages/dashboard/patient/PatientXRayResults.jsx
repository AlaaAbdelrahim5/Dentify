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
  StatsOverview 
} from '../../../components'
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
              Request #{request.id}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${
          getStatusColor(request.status, isDarkMode)
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
        {request.radiologyCenter && (
          <div className="flex items-center gap-2 text-sm">
            <FaHospital className="text-gray-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {request.radiologyCenter.centerName}
            </span>
          </div>
        )}
        {!request.radiologyCenter && (
          <div className="flex items-center gap-2 text-sm">
            <FaHospital className="text-gray-500 w-4 h-4" />
            <span className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Not assigned yet
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-gray-500 w-4 h-4" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Requested: {formatDateHelper(request.requestDate)}
          </span>
        </div>
        {request.availableDate && (
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-teal-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-teal-400' : 'text-teal-600'}>
              Available: {formatDateHelper(request.availableDate)}
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
        {request.reportFile && (
          <Button 
            variant="primary" 
            size="sm"
            className="w-full"
            onClick={() => handleDownloadReport(request.reportFile)}
            title={isReportFileUrl(request.reportFile) ? "View Report" : "Download Result"}
          >
            {isReportFileUrl(request.reportFile) ? (
              <>
                <FaLink className="w-4 h-4 mr-2" />
                View Report
              </>
            ) : (
              <>
                <FaDownload className="w-4 h-4 mr-2" />
                Download Result
              </>
            )}
          </Button>
        )}
        {!request.reportFile && request.status === 'COMPLETED' && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            disabled
          >
            <FaFileAlt className="w-4 h-4 mr-2" />
            No File Available
          </Button>
        )}
        {request.status !== 'COMPLETED' && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            disabled
          >
            <FaClock className="w-4 h-4 mr-2" />
            Pending Result
          </Button>
        )}
      </div>
    </Card>
  )

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
      {!isLoading && !filtering && filteredRequests.length === 0 ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaXRay className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {requests.length === 0 ? 'No X-ray requests yet' : 'No requests match your filters'}
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {requests.length === 0 
              ? 'Your dentist will request X-rays when needed for your treatment'
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
                      <span>Dr. {row.dentist?.firstName} {row.dentist?.lastName}</span>
                    )
                  },
                  {
                    label: 'Radiology Center',
                    accessor: 'radiologyCenter',
                    render: (value) => (
                      <span className={value?.centerName ? '' : 'text-gray-500 italic'}>
                        {value?.centerName || 'Not assigned yet'}
                      </span>
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
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleDownloadReport(row.reportFile)}
                            title={isReportFileUrl(row.reportFile) ? "View Report" : "Download Report"}
                          >
                            {isReportFileUrl(row.reportFile) ? (
                              <>
                                <FaLink className="w-4 h-4 mr-1" />
                                View
                              </>
                            ) : (
                              <>
                                <FaDownload className="w-4 h-4 mr-1" />
                                Download
                              </>
                            )}
                          </Button>
                        )}
                        {!row.reportFile && row.status === 'COMPLETED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                          >
                            No File
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
    </div>
  )
}

export default PatientXRayResults
