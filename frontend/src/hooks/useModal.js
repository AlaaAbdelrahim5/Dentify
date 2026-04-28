import { useState, useCallback, useEffect } from 'react'

/**
 * Custom hook for managing modal state and data
 * Eliminates duplicate modal state management logic
 * 
 * @param {Object} initialData - Initial form data structure
 * @param {Function} transformFn - Optional function to transform data when modal opens
 * @returns {Object} Modal state and handlers
 */
export const useModal = (initialData = {}, transformFn = null) => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Open modal with optional data
   */
  const openModal = useCallback((itemData = null) => {
    if (itemData && transformFn) {
      setData(transformFn(itemData))
    } else {
      setData(itemData)
    }
    setIsOpen(true)
  }, [transformFn])

  /**
   * Close modal and reset data
   */
  const closeModal = useCallback(() => {
    setIsOpen(false)
    setData(null)
    setIsLoading(false)
  }, [])

  /**
   * Update modal data
   */
  const updateData = useCallback((updates) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    isOpen,
    data,
    isLoading,
    setIsLoading,
    openModal,
    closeModal,
    updateData
  }
}

/**
 * Hook for managing modal form with validation
 * Combines modal state with form state
 * 
 * @param {Object} initialFormData - Initial form structure
 * @param {Function} validateFn - Validation function
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} Combined modal and form state
 */
export const useModalForm = (initialFormData = {}, validateFn = null, onSubmit = null) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [editData, setEditData] = useState(null)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
      setEditData(null)
    }
  }, [isOpen, initialFormData])

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editData) {
      setFormData(editData)
    }
  }, [isOpen, editData])

  const openModal = useCallback((data = null) => {
    setEditData(data)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleInputChange = useCallback((fieldOrEvent, value) => {
    if (fieldOrEvent?.target) {
      const { name, value: eventValue, type, checked } = fieldOrEvent.target
      const newValue = type === 'checkbox' ? checked : eventValue
      setFormData(prev => ({ ...prev, [name]: newValue }))
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    } else {
      setFormData(prev => ({ ...prev, [fieldOrEvent]: value }))
      
      // Clear error for this field
      if (errors[fieldOrEvent]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldOrEvent]
          return newErrors
        })
      }
    }
  }, [errors])

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    // Validate if function provided
    if (validateFn) {
      const validationErrors = validateFn(formData, !!editData)
      setErrors(validationErrors)
      
      if (Object.keys(validationErrors).length > 0) {
        return false
      }
    }

    // Submit if handler provided
    if (onSubmit) {
      try {
        setIsLoading(true)
        await onSubmit(formData, editData)
        closeModal()
        return true
      } catch (error) {
        console.error('Form submission error:', error)
        setErrors({ submit: error.message || 'Failed to submit form' })
        return false
      } finally {
        setIsLoading(false)
      }
    }

    return true
  }, [formData, editData, validateFn, onSubmit, closeModal])

  return {
    isOpen,
    formData,
    errors,
    isLoading,
    editData,
    isEditMode: !!editData,
    setFormData,
    setErrors,
    openModal,
    closeModal,
    handleInputChange,
    handleSubmit
  }
}
