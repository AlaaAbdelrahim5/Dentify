import { useState, useCallback } from 'react'

/**
 * Custom hook for managing CRUD operations with confirmation dialogs
 * Eliminates duplicate create, update, delete logic across management pages
 * 
 * @param {Object} api - API object with create, update, delete methods
 * @param {Function} onSuccess - Callback after successful operation
 * @param {Function} onError - Callback after failed operation
 * @returns {Object} CRUD state and handlers
 */
export const useCRUD = (api = {}, onSuccess = null, onError = null) => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  /**
   * Prepare confirmation modal for any action
   */
  const confirmOperation = useCallback((item, action) => {
    setSelectedItem(item)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }, [])

  /**
   * Execute the confirmed action
   */
  const executeOperation = useCallback(async (customFn = null) => {
    if (!selectedItem || !confirmAction) return

    setIsProcessing(true)

    try {
      let response
      const action = confirmAction

      // If custom function provided, use it
      if (customFn) {
        response = await customFn(selectedItem, action)
      } else {
        // Otherwise use standard API methods
        switch (action) {
          case 'delete':
            response = await api.delete?.(selectedItem._id || selectedItem.id)
            break
          case 'activate':
          case 'deactivate':
            response = await api.toggleStatus?.(selectedItem._id || selectedItem.id)
            break
          case 'approve':
            response = await api.approve?.(selectedItem._id || selectedItem.id)
            break
          case 'reject':
            response = await api.reject?.(selectedItem._id || selectedItem.id)
            break
          default:
            console.warn('Unknown action:', action)
            return
        }
      }

      if (response?.success || response?.data) {
        onSuccess?.({ action, item: selectedItem, response })
      } else {
        onError?.({ action, item: selectedItem, error: response?.message || 'Operation failed' })
      }
    } catch (error) {
      console.error(`Error executing ${confirmAction}:`, error)
      onError?.({ action: confirmAction, item: selectedItem, error: error.message })
    } finally {
      setIsProcessing(false)
      setShowConfirmModal(false)
      setSelectedItem(null)
      setConfirmAction(null)
    }
  }, [selectedItem, confirmAction, api, onSuccess, onError])

  /**
   * Cancel confirmation
   */
  const cancelOperation = useCallback(() => {
    setShowConfirmModal(false)
    setSelectedItem(null)
    setConfirmAction(null)
  }, [])

  /**
   * Quick helpers for common operations
   */
  const confirmDelete = useCallback((item) => confirmOperation(item, 'delete'), [confirmOperation])
  const confirmToggleStatus = useCallback((item) => {
    const status = item.user?.status || item.userId?.status
    const action = status === 'ACTIVE' || status === 'active' ? 'deactivate' : 'activate'
    confirmOperation(item, action)
  }, [confirmOperation])
  const confirmApprove = useCallback((item) => confirmOperation(item, 'approve'), [confirmOperation])
  const confirmReject = useCallback((item) => confirmOperation(item, 'reject'), [confirmOperation])

  return {
    selectedItem,
    showConfirmModal,
    confirmAction,
    isProcessing,
    confirmOperation,
    executeOperation,
    cancelOperation,
    confirmDelete,
    confirmToggleStatus,
    confirmApprove,
    confirmReject
  }
}

/**
 * Custom hook for managing toast notifications
 * 
 * @returns {Object} Toast state and handlers
 */
export const useToast = () => {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast])
  const showError = useCallback((message) => showToast(message, 'error'), [showToast])
  const showWarning = useCallback((message) => showToast(message, 'warning'), [showToast])
  const showInfo = useCallback((message) => showToast(message, 'info'), [showToast])
  
  const hideToast = useCallback(() => setToast(null), [])

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast
  }
}
