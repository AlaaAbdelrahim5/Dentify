/**
 * Shared form state management utilities
 * Eliminates duplicate logic for handling form state across modal components
 */

/**
 * Initialize form state for person modals (Patient, Dentist, Secretary)
 * @param {Object} personData - Existing person data (null for new)
 * @param {Array} additionalFields - Additional fields to initialize
 * @returns {Object} Initial form state
 */
export const initializePersonForm = (personData = null, additionalFields = {}) => {
  const baseFields = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    city: '',
    password: ''
  }

  if (personData) {
    // Format birth date for input field (YYYY-MM-DD)
    let formattedDate = ''
    if (personData.birthDate || personData.dateOfBirth) {
      const date = new Date(personData.birthDate || personData.dateOfBirth)
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0]
      }
    }

    return {
      firstName: personData.firstName || '',
      lastName: personData.lastName || '',
      email: personData.userId?.email || personData.email || '',
      phone: personData.userId?.phone || personData.phone || '',
      birthDate: formattedDate,
      gender: personData.gender?.toLowerCase() || personData.gender || '',
      city: personData.city || personData.address?.city || '',
      password: '', // Never populate password for security
      ...additionalFields
    }
  }

  return { ...baseFields, ...additionalFields }
}

/**
 * Extract nested user data for API submission
 * Common pattern for person-related API calls
 * @param {Object} formData - Form data
 * @param {string} role - User role (e.g., 'Patient', 'Dentist', 'Secretary')
 * @param {Object} additionalData - Additional data to merge
 * @returns {Object} Formatted data for API
 */
export const formatPersonDataForAPI = (formData, role, additionalData = {}) => {
  return {
    firstName: formData.firstName?.trim(),
    lastName: formData.lastName?.trim(),
    birthDate: formData.birthDate,
    gender: formData.gender,
    ...(formData.city && {
      address: {
        city: formData.city
      }
    }),
    userId: {
      email: formData.email?.trim(),
      phone: formData.phone?.trim(),
      ...(formData.password && { password: formData.password }),
      role,
      status: 'active'
    },
    ...additionalData
  }
}

/**
 * Format date string from ISO to YYYY-MM-DD for input fields
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string or empty string
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

/**
 * Clear form errors when user starts typing
 * Returns a function to be used in onChange handlers
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error setter function
 * @returns {Function} Handler to clear specific field error
 */
export const createErrorClearer = (errors, setErrors) => {
  return (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }
}

/**
 * Generic form submission handler
 * Validates form and calls onSave with proper data
 * @param {Object} options - Configuration options
 * @returns {Function} Form submit handler
 */
export const createFormSubmitHandler = ({
  formData,
  validateForm,
  onSave,
  onClose,
  isEditMode,
  existingData,
  formatData = null
}) => {
  return async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return false
    }

    try {
      const dataToSubmit = formatData
        ? formatData(formData)
        : isEditMode
        ? { ...existingData, ...formData }
        : formData

      await onSave(dataToSubmit)
      onClose()
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    }
  }
}

/**
 * Initialize working hours state (for dentists/clinics)
 * @param {Array} existingHours - Existing working hours
 * @returns {Array} Initialized working hours
 */
export const initializeWorkingHours = (existingHours = []) => {
  const defaultHours = {
    sunday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
    monday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
    tuesday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
    wednesday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
    thursday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
    friday: { isWorking: false, start: '09:00', end: '17:00', breaks: [] },
    saturday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] }
  }

  if (existingHours && existingHours.length > 0) {
    return existingHours
  }

  return Object.entries(defaultHours).map(([day, hours]) => ({
    day,
    ...hours
  }))
}

/**
 * Handle input change with error clearing
 * Combines input change and error clearing logic
 * @param {Function} setFormData - Form data setter
 * @param {Function} clearError - Error clearing function
 * @returns {Function} Input change handler
 */
export const createInputChangeHandler = (setFormData, clearError) => {
  return (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (clearError) {
      clearError(field)
    }
  }
}

/**
 * Parse API validation errors into form error format
 * @param {Object|string} error - API error response
 * @returns {Object} Form errors object
 */
export const parseAPIErrors = (error) => {
  if (typeof error === 'string') {
    return { submit: error }
  }

  if (error.response?.data?.errors) {
    return error.response.data.errors
  }

  if (error.response?.data?.message) {
    return { submit: error.response.data.message }
  }

  return { submit: 'An unexpected error occurred. Please try again.' }
}

/**
 * Batch update multiple form fields
 * @param {Object} updates - Fields to update
 * @param {Function} setFormData - Form data setter
 */
export const updateMultipleFields = (updates, setFormData) => {
  setFormData(prev => ({ ...prev, ...updates }))
}

/**
 * Reset form to initial state or provided state
 * @param {Object} initialState - Initial form state
 * @param {Function} setFormData - Form data setter
 * @param {Function} setErrors - Errors setter
 */
export const resetForm = (initialState, setFormData, setErrors) => {
  setFormData(initialState)
  if (setErrors) {
    setErrors({})
  }
}
