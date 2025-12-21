import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaXRay,
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCheck,
  FaClock,
  FaHospital,
  FaUser,
  FaCalendarAlt,
  FaExclamationCircle,
  FaBan,
  FaStethoscope,
  FaLink,
  FaTh,
  FaListAlt
} from 'react-icons/fa'
import { Card, Button, Input, DataTable, FilterBar, RadiologyRequestModal, ConfirmationModal, Toast } from '../../../components'
import { radiologyRequestsAPI, patientsAPI, radiologyAPI, treatmentsAPI } from '../../../services/api'

const DentistRadiology = () => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedImagingType, setSelectedImagingType] = useState('all')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [viewMode, setViewMode] = useState('table') // table or grid

  // Data states
  const [radiologyRequests, setRadiologyRequests] = useState([])
  const [patients, setPatients] = useState([])
  const [radiologyCenters, setRadiologyCenters] = useState([])
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalLoading, setModalLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch only requests on mount - fetch other data when modal opens
  useEffect(() => {
    fetchRadiologyRequests()
  }, [])

  const fetchRadiologyRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const requestsRes = await radiologyRequestsAPI.getDentistRequests()
      setRadiologyRequests(requestsRes.radiologyRequests || [])
    } catch (err) {
      console.error('Error fetching radiology requests:', err)
      setError('Failed to load radiology requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch modal data only when opening modal
  const fetchModalData = async () => {
    if (patients.length > 0) return // Already fetched
    
    try {
      setModalLoading(true)
      const [patientsRes, radiologyRes, treatmentsRes] = await Promise.all([
        patientsAPI.getAll(),
        radiologyAPI.getAll('limit=100&isActive=true'),
        treatmentsAPI.getDentistTreatments()
      ])
      setPatients(patientsRes.patients || [])
      const centers = radiologyRes.data || radiologyRes.radiology || []
      setRadiologyCenters(centers)
      setTreatments(treatmentsRes.treatments || [])
    } catch (err) {
      console.error('Error fetching modal data:', err)
    } finally {
      setModalLoading(false)
    }
  }

  // Transform radiology requests from API - use useMemo for performance
  const transformedRequests = useMemo(() => {
    const statusMap = {
      'REQUESTED': 'Requested',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    }
    
    return radiologyRequests.map(r => ({
      id: r.id,
      patientId: r.patientId,
      patientName: `${r.patient.firstName} ${r.patient.lastName}`,
      dentistId: r.dentistId,
      radiologyCenterId: r.radiologyCenterId,
      radiologyCenterName: r.radiologyCenter.centerName,
      treatmentId: r.treatmentId,
      treatmentName: r.treatment?.treatmentName || null,
      requestDate: r.requestDate,
      availableDate: r.availableDate,
      imagingType: r.imagingType,
      reportFile: r.reportFile,
      status: statusMap[r.status] || r.status,
      notes: r.notes || ''
    }))
  }, [radiologyRequests])

  // Transform patients for modal - use useMemo
  const transformedPatients = useMemo(() => 
    patients.map(p => ({
      id: p.userId,
      name: `${p.firstName} ${p.lastName}`
    }))
  , [patients])

  // Transform radiology centers for modal - use useMemo
  const transformedRadiologyCenters = useMemo(() => 
    radiologyCenters
      .filter(r => r.user && r.user.status === 'ACTIVE')
      .map(r => ({
        id: r.userId,
        name: r.centerName,
        supportedTypes: r.supportedTypes || []
      }))
  , [radiologyCenters])

  // Transform treatments for modal - use useMemo
  const transformedTreatments = useMemo(() => 
    treatments.map(t => ({
      id: t.id,
      treatmentName: t.treatmentName,
      patientName: `${t.patient.firstName} ${t.patient.lastName}`,
      patientId: t.patientId,
      date: t.createdAt
    }))
  , [treatments])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Requested':
        return <FaClock className="w-4 h-4" />
      case 'In Progress':
        return <FaExclamationCircle className="w-4 h-4" />
      case 'Completed':
        return <FaCheck className="w-4 h-4" />
      case 'Cancelled':
        return <FaBan className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Requested':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' 
          : 'bg-yellow-100 text-yellow-700 border-yellow-400'
      case 'In Progress':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'Completed':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'Cancelled':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      default:
        return isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-600' 
          : 'bg-white text-gray-700 border-gray-300'
    }
  }

  // Filter requests - use useMemo for performance
  const filteredRequests = useMemo(() => {
    return transformedRequests.filter(request => {
      const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.imagingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.radiologyCenterName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
      const matchesImagingType = selectedImagingType === 'all' || 
                                 request.imagingType?.trim() === selectedImagingType.trim()
      
      return matchesSearch && matchesStatus && matchesImagingType
    })
  }, [transformedRequests, searchTerm, selectedStatus, selectedImagingType])

  // Calculate stats - use useMemo for performance
  const stats = useMemo(() => {
    const total = transformedRequests.length
    const requested = transformedRequests.filter(r => r.status === 'Requested').length
    const inProgress = transformedRequests.filter(r => r.status === 'In Progress').length
    const completed = transformedRequests.filter(r => r.status === 'Completed').length
    
    return { total, requested, inProgress, completed }
  }, [transformedRequests])

  const handleNewRequest = async () => {
    setSelectedRequest(null)
    setIsRequestModalOpen(true)
    await fetchModalData()
  }

  const handleEditRequest = async (request) => {
    setSelectedRequest(request)
    setIsRequestModalOpen(true)
    await fetchModalData()
  }

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false)
    setSelectedRequest(null)
  }

  const handleSaveRequest = async (requestData) => {
    try {
      const apiData = {
        patientId: parseInt(requestData.patientId),
        radiologyCenterId: parseInt(requestData.radiologyCenterId),
        treatmentId: requestData.treatmentId ? parseInt(requestData.treatmentId) : null,
        imagingType: requestData.imagingType,
        notes: requestData.notes || ''
      }

      if (selectedRequest) {
        if (requestData.status) {
          apiData.status = requestData.status
        }
        await radiologyRequestsAPI.update(selectedRequest.id, apiData)
        setToast({ message: 'Radiology request updated successfully!', type: 'success' })
      } else {
        await radiologyRequestsAPI.create(apiData)
        setToast({ message: 'Radiology request created successfully!', type: 'success' })
      }
      await fetchRadiologyRequests() // Only refresh requests
      setIsRequestModalOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error saving radiology request:', error)
      setToast({ message: error.response?.data?.error || 'Failed to save radiology request. Please try again.', type: 'error' })
    }
  }

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await radiologyRequestsAPI.delete(selectedRequest.id)
      setToast({ message: 'Radiology request cancelled successfully!', type: 'success' })
      await fetchRadiologyRequests() // Only refresh requests
      setIsDeleteModalOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error deleting radiology request:', error)
      setToast({ message: 'Failed to delete radiology request. Please try again.', type: 'error' })
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedRequest(null)
  }

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

  const RequestCard = ({ request }) => (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <FaXRay className="text-purple-600 w-6 h-6" />
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
              {request.patientName}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${
          getStatusColor(request.status, isDarkMode)
        }`}>
          {getStatusIcon(request.status)}
          {request.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FaHospital className="text-gray-500 w-4 h-4" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {request.radiologyCenterName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-gray-500 w-4 h-4" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Requested: {new Date(request.requestDate).toLocaleDateString()}
          </span>
        </div>
        {request.availableDate && (
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-teal-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-teal-400' : 'text-teal-600'}>
              Available: {new Date(request.availableDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {request.treatmentId && request.treatmentName && (
          <div className="flex items-center gap-2 text-sm">
            <FaStethoscope className="text-purple-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-purple-400' : 'text-purple-600'}>
              Treatment: {request.treatmentName}
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
        {request.status === 'Requested' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditRequest(request)}
            title="Edit Request"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
        )}
        {request.reportFile && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDownloadReport(request.reportFile)}
            title={isReportFileUrl(request.reportFile) ? "View Report" : "Download Report"}
            className="text-green-600"
          >
            {isReportFileUrl(request.reportFile) ? (
              <FaLink className="w-4 h-4" />
            ) : (
              <FaDownload className="w-4 h-4" />
            )}
          </Button>
        )}
        {request.status === 'Requested' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteRequest(request)}
            title="Cancel Request"
            className="text-red-600"
          >
            <FaTrash className="w-4 h-4" />
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
            Radiology Requests
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage diagnostic imaging requests
          </p>
        </div>
        <Button variant="primary" onClick={handleNewRequest} className="bg-purple-600 hover:bg-purple-700">
          <FaPlus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>



      {/* Filters and View Mode */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              searchPlaceholder="Search by patient, imaging type, or radiology center..."
              filters={[
                {
                  value: selectedStatus,
                  onChange: (e) => setSelectedStatus(e.target.value),
                  options: [
                    { value: 'all', label: 'All Status' },
                    { value: 'Requested', label: 'Requested' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Cancelled', label: 'Cancelled' }
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
      {loading ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
          <p className={`mt-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Loading radiology requests...
          </p>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaXRay className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {transformedRequests.length === 0 ? 'No radiology requests yet' : 'No requests match your filters'}
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {transformedRequests.length === 0 
              ? 'Create your first radiology request to get started'
              : 'Try adjusting your search or filter criteria'}
          </p>
          {transformedRequests.length === 0 && (
            <Button 
              variant="primary" 
              onClick={handleNewRequest}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create First Request
            </Button>
          )}
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
                    accessor: 'patientName',
                    render: (value, row) => (
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500 w-4 h-4" />
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  },
                  {
                    label: 'Imaging Type',
                    accessor: 'imagingType'
                  },
                  {
                    label: 'Radiology Center',
                    accessor: 'radiologyCenterName',
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <FaHospital className="text-gray-500 w-4 h-4" />
                        <span>{value}</span>
                      </div>
                    )
                  },
                  {
                    label: 'Request Date',
                    accessor: 'requestDate',
                    render: (value) => new Date(value).toLocaleDateString()
                  },
                  {
                    label: 'Available Date',
                    accessor: 'availableDate',
                    render: (value) => value ? (
                      <div className="flex items-center gap-2 text-teal-500">
                        <FaClock className="w-4 h-4" />
                        <span>{new Date(value).toLocaleDateString()}</span>
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
                        {value}
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
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(row.reportFile)}
                            title={isReportFileUrl(row.reportFile) ? "View Report" : "Download Report"}
                            className="text-green-600"
                          >
                            {isReportFileUrl(row.reportFile) ? (
                              <FaLink className="w-4 h-4" />
                            ) : (
                              <FaDownload className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        {row.status === 'Requested' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteRequest(row)}
                            title="Cancel Request"
                            className="text-red-600"
                          >
                            <FaTrash className="w-4 h-4" />
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
      <RadiologyRequestModal
        isOpen={isRequestModalOpen}
        onClose={handleCloseRequestModal}
        onSave={handleSaveRequest}
        patients={transformedPatients}
        radiologyCenters={transformedRadiologyCenters}
        treatments={transformedTreatments}
        initialData={selectedRequest}
        loading={modalLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        item={selectedRequest}
        action="delete"
        itemName={selectedRequest?.imagingType || 'Request'}
        itemType="Radiology Request"
      />

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

export default DentistRadiology
