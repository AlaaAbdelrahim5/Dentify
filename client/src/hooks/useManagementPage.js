import { useState, useCallback } from 'react'
import { useDataFetching } from './useDataFetching'
import { useStatsFetching } from './useDataFetching'
import { useCRUD, useToast } from './useCRUD'
import { useDebounce } from './useDebounce'

/**
 * Custom hook that combines all common management page functionality
 * Provides a complete solution for typical management pages
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.fetchFn - Function to fetch main data
 * @param {Function} config.fetchStatsFn - Function to fetch statistics
 * @param {Object} config.api - API object with CRUD methods
 * @param {Object} config.initialStats - Initial stats state
 * @param {Object} config.initialFilters - Initial filter state
 * @returns {Object} Complete management page state and handlers
 */
export const useManagementPage = ({
  fetchFn,
  fetchStatsFn,
  api,
  initialStats = {},
  initialFilters = {}
}) => {
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Data fetching
  const dataState = useDataFetching(
    fetchFn,
    { ...initialFilters, search: debouncedSearchTerm },
    [debouncedSearchTerm]
  )

  // Stats fetching
  const statsState = useStatsFetching(fetchStatsFn, initialStats, [])

  // Toast notifications
  const toastState = useToast()

  // CRUD operations
  const crudState = useCRUD(api, 
    ({ action, item }) => {
      dataState.refresh()
      statsState.refreshStats()
      toastState.showSuccess(`Item ${action}d successfully`)
    },
    ({ action, error }) => {
      toastState.showError(error || `Failed to ${action} item`)
    }
  )

  /**
   * View item details
   */
  const handleViewDetails = useCallback((item) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }, [])

  /**
   * Add new item
   */
  const handleAdd = useCallback(() => {
    setSelectedItem(null)
    setShowAddModal(true)
  }, [])

  /**
   * Edit existing item
   */
  const handleEdit = useCallback((item) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }, [])

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    setShowDetailsModal(false)
    setShowAddModal(false)
    setShowEditModal(false)
    setSelectedItem(null)
  }, [])

  /**
   * Handle successful save (add/edit)
   */
  const handleSaveSuccess = useCallback(() => {
    closeAllModals()
    dataState.refresh()
    statsState.refreshStats()
    toastState.showSuccess('Saved successfully')
  }, [closeAllModals, dataState, statsState, toastState])

  return {
    // Data
    data: dataState.data,
    loading: dataState.loading,
    filtering: dataState.filtering,
    error: dataState.error,
    
    // Pagination
    currentPage: dataState.currentPage,
    totalPages: dataState.totalPages,
    goToPage: dataState.goToPage,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filters: dataState.filters,
    updateFilters: dataState.updateFilters,
    clearFilters: dataState.clearFilters,
    
    // Stats
    stats: statsState.stats,
    statsLoading: statsState.loading,
    
    // Modals
    showDetailsModal,
    showAddModal,
    showEditModal,
    selectedItem,
    handleViewDetails,
    handleAdd,
    handleEdit,
    closeAllModals,
    handleSaveSuccess,
    
    // CRUD
    showConfirmModal: crudState.showConfirmModal,
    confirmAction: crudState.confirmAction,
    isProcessing: crudState.isProcessing,
    executeOperation: crudState.executeOperation,
    cancelOperation: crudState.cancelOperation,
    confirmDelete: crudState.confirmDelete,
    confirmToggleStatus: crudState.confirmToggleStatus,
    confirmApprove: crudState.confirmApprove,
    confirmReject: crudState.confirmReject,
    
    // Toast
    toast: toastState.toast,
    showToast: toastState.showToast,
    showSuccess: toastState.showSuccess,
    showError: toastState.showError,
    
    // Refresh
    refresh: dataState.refresh,
    refreshStats: statsState.refreshStats
  }
}
