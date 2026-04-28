import { useState, useCallback } from 'react'

/**
 * Custom hook for handling form input changes with nested object support
 * Eliminates duplicate handleInputChange logic across components
 * 
 * @param {Object} initialState - Initial form state
 * @returns {Object} Object containing formData, setFormData, and handleInputChange
 */
export const useFormInput = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState)

  /**
   * Handle input change for both simple and nested fields
   * Supports event objects (e.target) and direct value updates
   * 
   * @param {string|Object} fieldOrEvent - Field name (e.g., 'name' or 'address.city') or event object
   * @param {*} value - New value (optional if event object is provided)
   */
  const handleInputChange = useCallback((fieldOrEvent, value) => {
    // Handle event object (from onChange)
    if (fieldOrEvent?.target) {
      const { name, value: eventValue, type, checked } = fieldOrEvent.target
      const newValue = type === 'checkbox' ? checked : eventValue
      
      if (name.includes('.')) {
        // Handle nested field from event
        const [parent, child] = name.split('.')
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: newValue
          }
        }))
      } else {
        // Handle simple field from event
        setFormData(prev => ({ ...prev, [name]: newValue }))
      }
    } else {
      // Handle direct field and value (field, value)
      const field = fieldOrEvent
      
      if (field.includes('.')) {
        // Handle nested field
        const [parent, child] = field.split('.')
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }))
      } else {
        // Handle simple field
        setFormData(prev => ({ ...prev, [field]: value }))
      }
    }
  }, [])

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialState)
  }, [initialState])

  /**
   * Set multiple fields at once
   * @param {Object} updates - Object with field names and values
   */
  const setMultipleFields = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm,
    setMultipleFields
  }
}

/**
 * Custom hook for managing form errors
 * 
 * @param {Object} initialErrors - Initial errors state
 * @returns {Object} Object containing errors, setErrors, clearError, and clearErrors
 */
export const useFormErrors = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors)

  /**
   * Clear a specific error
   * @param {string} field - Field name to clear error for
   */
  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Set a single error
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  const setError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  return {
    errors,
    setErrors,
    clearError,
    clearErrors,
    setError
  }
}
