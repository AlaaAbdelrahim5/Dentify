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
import { Button, Input, Card, LoadingSpinner } from '../../../components'
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
  const searchTimeoutRef = useRef(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
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

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

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

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
        isActive
          ? isDarkMode 
            ? 'bg-green-900/20 text-green-400 border-green-800'
            : 'bg-green-100 text-green-800 border-green-200'
          : isDarkMode
            ? 'bg-red-900/20 text-red-400 border-red-800'
            : 'bg-red-100 text-red-800 border-red-200'
      }`}>
        {isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
        {isActive ? 'Active' : 'Inactive'}
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

  // Modern Confirmation Modal Component
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, admin, action }) => {
    if (!isOpen || !admin) return null

    const isDeactivate = action === 'deactivate'

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
            className={`relative rounded-2xl shadow-2xl w-full max-w-md transform transition-all ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon and Title */}
            <div className="flex flex-col items-center pt-8 pb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  isDeactivate
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/50'
                    : 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50'
                }`}
              >
                {isDeactivate ? (
                  <FaTimesCircle className="w-10 h-10 text-white" />
                ) : (
                  <FaCheckCircle className="w-10 h-10 text-white" />
                )}
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isDeactivate ? 'Deactivate Admin?' : 'Activate Admin?'}
              </h3>

              {/* Description */}
              <p className={`text-center px-6 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to {action}{' '}
                <span className="font-semibold">{admin.fullName}</span>?
              </p>

              {/* Warning */}
              <p className={`text-sm text-center px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isDeactivate
                  ? 'The admin will no longer have access to the system.'
                  : 'The admin will regain full access to the system.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-6 pt-2">
              <button
                onClick={onClose}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 shadow-lg ${
                  isDeactivate
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/50'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/50'
                }`}
              >
                {isDeactivate ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin Details Modal Component
  const AdminDetailsModal = ({ admin, onClose }) => {
    if (!admin) return null

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
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <FaUserShield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {admin.fullName}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Administrator
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(admin.userId?.status === 'active')}
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created on {formatDate(admin.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Personal Information */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaUserShield className="w-4 h-4 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>First Name:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{admin.firstName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Last Name:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{admin.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gender:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                        {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaEnvelope className="w-4 h-4 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{admin.userId?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{admin.userId?.phone}</span>
                    </div>
                  </div>
                </Card>
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
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
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

  if (loading && isFirstLoad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage system administrators
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <FaPlus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Admins
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Admins
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
              <MdVerified className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Inactive Admins
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
              <FaTimesCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={FaSearch}
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Admins List */}
      <Card>
        {filtering && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        
        {!filtering && admins.length === 0 && (
          <div className="text-center py-12">
            <FaUserShield className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No admins found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'Try adjusting your search criteria' : 'No administrators yet'}
            </p>
          </div>
        )}

        {!filtering && admins.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Admin
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Contact
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Created Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {admins.map((admin) => (
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
                      {getStatusBadge(admin.userId?.status === 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(admin.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setShowDetailsModal(true)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleAdminStatus(admin)}
                          className={`p-2 rounded-lg transition-colors ${
                            admin.userId?.status === 'active'
                              ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          }`}
                          title={admin.userId?.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {admin.userId?.status === 'active' ? <FaTimesCircle className="w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

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
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedAdmin(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        admin={selectedAdmin}
        action={confirmAction}
      />
    </div>
  )
}

export default AdminsManagement