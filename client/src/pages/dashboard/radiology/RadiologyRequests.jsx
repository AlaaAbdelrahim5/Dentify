import { useState, useEffect } from 'react'
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
  FaFilter
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
  LoadingSpinner
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import RequestDetailsModal from '../../../components/radiology/RequestDetailsModal'
import UploadResultModal from '../../../components/radiology/UploadResultModal'

const RadiologyRequests = ({ radiologyData, onStatsUpdate }) => {
  const { isDarkMode } = useTheme()
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeView, setActiveView] = useState('all') // all, requested, in-progress, completed
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch requests
  useEffect(() => {
    fetchRequests()
  }, [])

  // Filter requests
  useEffect(() => {
    let filtered = requests

    // Filter by view/status
    if (activeView === 'requested') {
      filtered = filtered.filter(req => req.status === 'REQUESTED')
    } else if (activeView === 'in-progress') {
      filtered = filtered.filter(req => req.status === 'IN_PROGRESS')
    } else if (activeView === 'completed') {
      filtered = filtered.filter(req => req.status === 'COMPLETED')
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.dentist?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.dentist?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.imagingType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
    setCurrentPage(1)
  }, [requests, activeView, searchTerm])

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      REQUESTED: { color: 'yellow', icon: MdPendingActions, label: 'Requested' },
      IN_PROGRESS: { color: 'blue', icon: FaClock, label: 'In Progress' },
      COMPLETED: { color: 'green', icon: FaCheckCircle, label: 'Completed' },
      CANCELLED: { color: 'red', icon: FaClock, label: 'Cancelled' }
    }

    const config = statusConfig[status] || statusConfig.REQUESTED
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
        ${config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
        ${config.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
        ${config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
        ${config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
      `}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Imaging Requests"
          description="Manage and process radiology imaging requests"
        />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Stats for StatsOverview component
  const statsData = [
    {
      label: 'Total',
      value: requests.length,
      icon: FaXRay,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      label: 'Requested',
      value: requests.filter(r => r.status === 'REQUESTED').length,
      icon: MdPendingActions,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'In Progress',
      value: requests.filter(r => r.status === 'IN_PROGRESS').length,
      icon: FaClock,
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      label: 'Completed',
      value: requests.filter(r => r.status === 'COMPLETED').length,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-teal-600'
    }
  ]

  const requestedRequests = requests.filter(r => r.status === 'REQUESTED')
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS')
  const completedRequests = requests.filter(r => r.status === 'COMPLETED')

  const handleClearFilters = () => {
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Imaging Requests"
        description="Manage and process radiology imaging requests"
      />

      {/* Statistics Summary */}
      <StatsOverview stats={statsData} />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeView === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveView('all')}
            className={activeView === 'all' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
          >
            All Requests ({requests.length})
          </Button>
          <Button
            variant={activeView === 'requested' ? 'primary' : 'outline'}
            onClick={() => setActiveView('requested')}
            className={activeView === 'requested' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
          >
            Requested ({requestedRequests.length})
          </Button>
          <Button
            variant={activeView === 'in-progress' ? 'primary' : 'outline'}
            onClick={() => setActiveView('in-progress')}
            className={activeView === 'in-progress' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
          >
            In Progress ({inProgressRequests.length})
          </Button>
          <Button
            variant={activeView === 'completed' ? 'primary' : 'outline'}
            onClick={() => setActiveView('completed')}
            className={activeView === 'completed' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
          >
            Completed ({completedRequests.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by patient name, dentist, or imaging type..."
        filters={[]}
        onClearFilters={handleClearFilters}
      />

      {/* Requests Table */}
      <DataTable
        columns={[
          { key: 'id', label: 'Request ID' },
          { key: 'patient', label: 'Patient' },
          { key: 'dentist', label: 'Dentist' },
          { key: 'imagingType', label: 'Imaging Type' },
          { key: 'requestDate', label: 'Request Date' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={currentRequests}
        renderRow={(request) => (
          <tr key={request.id} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`font-mono text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                #{request.id}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                }`}>
                  <FaUser className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {request.patient?.firstName} {request.patient?.lastName}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                Dr. {request.dentist?.firstName} {request.dentist?.lastName}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <FaXRay className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {request.imagingType}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                  {formatDate(request.requestDate)}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {getStatusBadge(request.status)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(request)}
                  title="View Details"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FaEye className="w-4 h-4" />
                </Button>
                {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadResult(request)}
                    title="Upload Result"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <FaFileUpload className="w-4 h-4" />
                  </Button>
                )}
                {request.reportFile && (
                  <a
                    href={request.reportFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download Report"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <FaDownload className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            </td>
          </tr>
        )}
        emptyMessage="No requests found"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
