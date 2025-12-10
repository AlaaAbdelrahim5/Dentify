import { useState, useEffect, useRef } from 'react'
import {
  FaUsers,
  FaUserShield,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaUserMd,
  FaCheck,
  FaSave,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'
import { MdVerified, MdBlock } from 'react-icons/md'
import { formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'
import { validateEmail } from '../../../utils/validation'
import { useDebounce } from '../../../hooks'
import { 
  Button, 
  Input, 
  Card, 
  LoadingSpinner,
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { adminAPI } from '../../../services/api'

const AdminsManagement = () => {
  const { isDarkMode } = useTheme()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  // Fetch admins
  const fetchAdmins = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      const params = {
        page: currentPage.toString(),
        limit: '10'
      }

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm
      }

      const response = await adminAPI.getAllAdmins(params)
      
      if (response.success) {
        setAdmins(response.data || [])
        setTotalPages(response.totalPages || 1)
      }

      // Fetch stats separately
      const statsResponse = await adminAPI.getAdminStats()
      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  // Toggle admin status
  const handleToggleAdminStatus = async (admin) => {
    const action = admin.userId?.status === 'active' ? 'deactivate' : 'activate'
    
    setSelectedAdmin(admin)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const admin = selectedAdmin
    const action = confirmAction

    try {
      const response = await adminAPI.toggleStatus(admin._id)
      
      if (response.success) {
        // Refresh the admins list
        fetchAdmins()
        setShowConfirmModal(false)
        setSelectedAdmin(null)
        setConfirmAction(null)
      } else {
        alert(response.message || `Failed to ${action} admin`)
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error)
      alert(`An error occurred while ${action}ing the admin`)
    }
  }

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      setCurrentPage(1)
      fetchAdmins(true)
    }
  }, [debouncedSearchTerm])

  // Fetch data when page changes
  useEffect(() => {
    if (!isFirstLoad) {
      fetchAdmins()
    }
  }, [currentPage])

  // Initial load
  useEffect(() => {
    fetchAdmins()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Component configurations
  const statsConfig = [
    {
      label: 'Total Admins',
      value: stats.total,
      icon: FaUsers,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Admins',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Admins',
      value: stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ]

  const filterProps = {
    searchTerm,
    onSearchChange: (e) => setSearchTerm(e.target.value),
    debouncedSearchTerm,
    filters: [],
    onClearFilters: () => {
      setSearchTerm('')
      setCurrentPage(1)
    },
    filtering,
    searchPlaceholder: 'Search admins by name or email...'
  }

  const columns = [
    { key: 'admin', label: 'Admin' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created Date' },
    { key: 'actions', label: 'Actions' }
  ]

  const renderRow = (admin) => (
    <tr key={admin._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <FaUserShield className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {admin.fullName}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {admin.userId?.email}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {admin.userId?.phone}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          isActive={admin.userId?.status === 'active'}
          activeIcon={FaCheckCircle}
          inactiveIcon={FaTimesCircle}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDateHelper(admin.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <ActionButtons
          actions={[
            {
              icon: FaEye,
              onClick: () => {
                setSelectedAdmin(admin)
                setShowDetailsModal(true)
              },
              title: 'View Details',
              variant: 'default'
            },
            {
              icon: admin.userId?.status === 'active' ? FaTimesCircle : FaCheckCircle,
              onClick: () => handleToggleAdminStatus(admin),
              title: admin.userId?.status === 'active' ? 'Deactivate' : 'Activate',
              variant: admin.userId?.status === 'active' ? 'warning' : 'success'
            }
          ]}
        />
      </td>
    </tr>
  )

  const tableProps = {
    columns,
    data: admins,
    renderRow,
    loading: filtering,
    emptyMessage: searchTerm ? 'Try adjusting your search criteria' : 'No administrators yet',
    emptyIcon: FaUserShield,
    hasFilters: !!searchTerm
  }

  const confirmProps = {
    isOpen: showConfirmModal,
    onClose: () => {
      setShowConfirmModal(false)
      setSelectedAdmin(null)
      setConfirmAction(null)
    },
    onConfirm: executeToggleStatus,
    item: selectedAdmin,
    action: confirmAction,
    itemName: selectedAdmin?.fullName,
    itemType: 'Admin'
  }

  // Admin Details Modal Component
  const AdminDetailsModal = ({ admin, onClose }) => {
    if (!admin) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              
              {/* Avatar and basic info */}
              <div className="flex items-center gap-4 mt-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                    {admin.userId?.profileImage ? (
                      <img 
                        src={getImageUrl(admin.userId.profileImage)}
                        alt={admin.fullName}
                        className="w-24 h-24 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    {admin.userId?.profileImage ? (
                      <FaUserShield className="w-12 h-12 text-teal-600 hidden" />
                    ) : (
                      <FaUserShield className="w-12 h-12 text-teal-600" />
                    )}
                  </div>
                  {/* Status indicator on avatar */}
                  <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                    admin.userId?.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {admin.userId?.status === 'active' ? (
                      <FaCheck className="w-3 h-3 text-white" />
                    ) : (
                      <FaTimes className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {admin.fullName}
                  </h2>
                  <p className="text-teal-100 text-sm mb-2">
                    Administrator
                  </p>
                  <StatusBadge 
                    isActive={admin.userId?.status === 'active'}
                    activeIcon={FaCheckCircle}
                    inactiveIcon={FaTimesCircle}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaUserShield className="w-5 h-5 text-teal-600" />
                    Personal Information
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        First Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {admin.firstName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {admin.lastName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Gender
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Created Date
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDateHelper(admin.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaEnvelope className="w-5 h-5 text-teal-600" />
                    Contact Information
                  </h3>
                  <div className={`space-y-3 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <FaEnvelope className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Email Address
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {admin.userId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <FaPhone className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Phone Number
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {admin.userId?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add Admin Modal Component
  const AddAdminModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      phone: '',
      firstName: '',
      lastName: '',
      gender: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const resetForm = () => {
      setFormData({
        email: '',
        password: '',
        phone: '',
        firstName: '',
        lastName: '',
        gender: ''
      })
      setErrors({})
    }

    useEffect(() => {
      if (isOpen) {
        resetForm()
      }
    }, [isOpen])

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))

      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }))
      }
    }

    const validateForm = () => {
      const newErrors = {}

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      }

      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setLoading(true)

      try {
        const response = await adminAPI.createAdmin(formData)

        if (response.success) {
          onSave(response.data, 'created')
          onClose()
        } else {
          if (response.errors) {
            setErrors(response.errors)
          } else {
            setErrors({
              general: response.message || 'An error occurred while creating the admin'
            })
          }
        }
      } catch (error) {
        console.error('Error creating admin:', error)
        setErrors({ general: 'Network error. Please try again.' })
      } finally {
        setLoading(false)
      }
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-transparent transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaUserShield className="w-6 h-6 text-blue-600" />
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Add New Admin
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Form Container with Scroll */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      First Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      error={errors.firstName}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      error={errors.lastName}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.gender
                        ? "border-red-500"
                        : isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="admin@example.com"
                      error={errors.email}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Phone Number *
                    </label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+970123456789"
                      error={errors.phone}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password"
                    error={errors.password}
                  />
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex justify-end gap-3 pt-6 border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaSave className="w-4 h-4" />
                    )}
                    {loading ? "Creating..." : "Create Admin"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Admin Management"
        description="Manage system administrators"
        action={{
          label: 'Add Admin',
          onClick: () => setShowAddModal(true),
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Search and Filters */}
      <FilterBar {...filterProps} />

      {/* Admins Table */}
      {loading && isFirstLoad ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable {...tableProps} />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Admin Details Modal */}
      {showDetailsModal && (
        <AdminDetailsModal
          admin={selectedAdmin}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAdmin(null)
          }}
        />
      )}

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newAdmin, action) => {
          // Refresh the admins list
          fetchAdmins()
          // Show success message
          console.log(`Admin ${action} successfully:`, newAdmin)
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        itemType="Admin"
        {...confirmProps}
      />
    </div>
  )
}

export default AdminsManagement