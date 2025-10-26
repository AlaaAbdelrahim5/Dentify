import { useState } from 'react'
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
import { Card, Button, Input, DataTable, FilterBar, StatsOverview } from '../../../components'
import RadiologyRequestModal from '../../../components/dentist/RadiologyRequestModal'
import DeleteConfirmationModal from '../../../components/dentist/DeleteConfirmationModal'

const DentistRadiology = () => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedImagingType, setSelectedImagingType] = useState('all')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [viewMode, setViewMode] = useState('table') // table or grid

  // Mock radiology requests data
  const mockRadiologyRequests = [
    {
      id: 1,
      patientId: 101,
      patientName: 'John Smith',
      dentistId: 1,
      radiologyCenterId: 1,
      radiologyCenterName: 'Central Radiology Center',
      treatmentId: 201,
      treatmentType: 'Dental Implant',
      requestDate: '2024-02-15',
      availableDate: '2024-02-20',
      imagingType: 'CBCT',
      reportFile: 'report_001.pdf',
      status: 'Completed',
      notes: 'Detailed scan for implant planning'
    },
    {
      id: 2,
      patientId: 102,
      patientName: 'Sarah Johnson',
      dentistId: 1,
      radiologyCenterId: 2,
      radiologyCenterName: 'Advanced Imaging Clinic',
      treatmentId: 202,
      treatmentType: 'Orthodontic Treatment',
      requestDate: '2024-02-18',
      availableDate: '2024-02-22',
      imagingType: 'Panoramic X-ray',
      reportFile: null,
      status: 'In Progress',
      notes: 'Pre-orthodontic assessment'
    },
    {
      id: 3,
      patientId: 104,
      patientName: 'Emily Davis',
      dentistId: 1,
      radiologyCenterId: 1,
      radiologyCenterName: 'Central Radiology Center',
      treatmentId: null,
      treatmentType: null,
      requestDate: '2024-02-20',
      availableDate: '2024-02-25',
      imagingType: 'Periapical',
      reportFile: null,
      status: 'Requested',
      notes: 'Check tooth #18 before extraction'
    },
    {
      id: 4,
      patientId: 105,
      patientName: 'Robert Brown',
      dentistId: 1,
      radiologyCenterId: 3,
      radiologyCenterName: 'DentaScan Radiology',
      treatmentId: 203,
      treatmentType: 'Root Canal',
      requestDate: '2024-02-10',
      availableDate: '2024-02-15',
      imagingType: 'Bitewing',
      reportFile: 'report_004.pdf',
      status: 'Completed',
      notes: 'Cavity detection'
    },
    {
      id: 5,
      patientId: 103,
      patientName: 'Mike Wilson',
      dentistId: 1,
      radiologyCenterId: 2,
      radiologyCenterName: 'Advanced Imaging Clinic',
      treatmentId: null,
      treatmentType: null,
      requestDate: '2024-02-22',
      availableDate: '',
      imagingType: '3D Imaging',
      reportFile: null,
      status: 'Requested',
      notes: 'TMJ assessment'
    }
  ]

  // Mock patients
  const mockPatients = [
    { id: 101, name: 'John Smith' },
    { id: 102, name: 'Sarah Johnson' },
    { id: 103, name: 'Mike Wilson' },
    { id: 104, name: 'Emily Davis' },
    { id: 105, name: 'Robert Brown' }
  ]

  // Mock radiology centers
  const mockRadiologyCenters = [
    { id: 1, name: 'Central Radiology Center' },
    { id: 2, name: 'Advanced Imaging Clinic' },
    { id: 3, name: 'DentaScan Radiology' }
  ]

  // Mock treatments
  const mockTreatments = [
    { id: 201, treatmentType: 'Dental Implant', patientName: 'John Smith', patientId: 101 },
    { id: 202, treatmentType: 'Orthodontic Treatment', patientName: 'Sarah Johnson', patientId: 102 },
    { id: 203, treatmentType: 'Root Canal', patientName: 'Robert Brown', patientId: 105 },
    { id: 204, treatmentType: 'Crown Installation', patientName: 'Mike Wilson', patientId: 103 }
  ]

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

  const filteredRequests = mockRadiologyRequests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.imagingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.radiologyCenterName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesImagingType = selectedImagingType === 'all' || request.imagingType === selectedImagingType
    
    return matchesSearch && matchesStatus && matchesImagingType
  })

  const getStats = () => {
    const total = mockRadiologyRequests.length
    const requested = mockRadiologyRequests.filter(r => r.status === 'Requested').length
    const inProgress = mockRadiologyRequests.filter(r => r.status === 'In Progress').length
    const completed = mockRadiologyRequests.filter(r => r.status === 'Completed').length
    
    return { total, requested, inProgress, completed }
  }

  const stats = getStats()

  const handleNewRequest = () => {
    setSelectedRequest(null)
    setIsRequestModalOpen(true)
  }

  const handleEditRequest = (request) => {
    setSelectedRequest(request)
    setIsRequestModalOpen(true)
  }

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false)
    setSelectedRequest(null)
  }

  const handleSaveRequest = (requestData) => {
    console.log('Radiology request:', requestData)
    // Here you would save to backend
  }

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    console.log('Delete request:', selectedRequest.id)
    setIsDeleteModalOpen(false)
    setSelectedRequest(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedRequest(null)
  }

  const handleDownloadReport = (request) => {
    console.log('Download report:', request.reportFile)
    // Here you would download the file
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
          getStatusColor(request.status)
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
        {request.treatmentId && request.treatmentType && (
          <div className="flex items-center gap-2 text-sm">
            <FaStethoscope className="text-purple-500 w-4 h-4" />
            <span className={isDarkMode ? 'text-purple-400' : 'text-purple-600'}>
              Treatment: {request.treatmentType}
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
          onClick={() => handleEditRequest(request)}
          title="Edit Request"
        >
          <FaEdit className="w-4 h-4" />
        </Button>
        {request.reportFile && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDownloadReport(request)}
            title="Download Report"
            className="text-green-600"
          >
            <FaDownload className="w-4 h-4" />
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

      {/* Stats Overview */}
      <StatsOverview stats={[
        { 
          label: 'Total Requests', 
          value: stats.total, 
          icon: FaXRay, 
          gradient: 'from-purple-600 to-purple-700' 
        },
        { 
          label: 'Requested', 
          value: stats.requested, 
          icon: FaClock, 
          gradient: 'from-yellow-600 to-yellow-700' 
        },
        { 
          label: 'In Progress', 
          value: stats.inProgress, 
          icon: FaExclamationCircle, 
          gradient: 'from-blue-600 to-blue-700' 
        },
        { 
          label: 'Completed', 
          value: stats.completed, 
          icon: FaCheck, 
          gradient: 'from-green-600 to-green-700' 
        }
      ]} />

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
                    { value: 'X-ray', label: 'X-ray' },
                    { value: 'Panoramic X-ray', label: 'Panoramic X-ray' },
                    { value: 'CBCT', label: 'CBCT' },
                    { value: 'CT Scan', label: 'CT Scan' },
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
            No radiology requests found
          </h3>
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No requests match your current filters
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRequest(row)}
                          title="Edit Request"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Button>
                        {row.reportFile && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(row)}
                            title="Download Report"
                            className="text-green-600"
                          >
                            <FaDownload className="w-4 h-4" />
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
        patients={mockPatients}
        radiologyCenters={mockRadiologyCenters}
        treatments={mockTreatments}
        initialData={selectedRequest}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        appointmentData={selectedRequest ? {
          patient: { name: selectedRequest.patientName },
          treatment: selectedRequest.imagingType,
          time: ''
        } : null}
      />
    </div>
  )
}

export default DentistRadiology
