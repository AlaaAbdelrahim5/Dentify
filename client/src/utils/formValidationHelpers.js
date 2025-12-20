/**
 * Shared utility functions for form validation
 * Reduces duplicate validation logic across components
 */

/**
 * Validate required fields in form data
 * @param {Object} data - Form data object
 * @param {Array} requiredFields - Array of required field names or config objects
 * @returns {Object} Validation errors object
 * 
 * Example:
 * validateRequiredFields(formData, ['name', 'email', { field: 'phone', label: 'Phone Number' }])
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {}

  requiredFields.forEach(field => {
    const fieldName = typeof field === 'string' ? field : field.field
    const label = typeof field === 'string' 
      ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1) 
      : field.label

    if (!data[fieldName] || (typeof data[fieldName] === 'string' && !data[fieldName].trim())) {
      errors[fieldName] = `${label} is required`
    }
  })

  return errors
}

/**
 * Validate date fields
 * @param {string} date - Date string
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null
 */
export const validateDate = (date, options = {}) => {
  const { 
    required = false, 
    pastOnly = false, 
    futureOnly = false,
    minAge = null,
    maxAge = null,
    label = 'Date'
  } = options

  if (!date) {
    return required ? `${label} is required` : null
  }

  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (isNaN(selectedDate.getTime())) {
    return `Invalid ${label.toLowerCase()}`
  }

  if (pastOnly && selectedDate > today) {
    return `${label} cannot be in the future`
  }

  if (futureOnly && selectedDate < today) {
    return `${label} cannot be in the past`
  }

  if (minAge !== null) {
    const age = Math.floor((today - selectedDate) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < minAge) {
      return `Must be at least ${minAge} years old`
    }
  }

  if (maxAge !== null) {
    const age = Math.floor((today - selectedDate) / (365.25 * 24 * 60 * 60 * 1000))
    if (age > maxAge) {
      return `Must be at most ${maxAge} years old`
    }
  }

  return null
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @param {boolean} required - Whether field is required
 * @returns {string|null} Error message or null
 */
export const validatePhone = (phone, required = false) => {
  if (!phone) {
    return required ? 'Phone number is required' : null
  }

  // Remove spaces and special characters for validation
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Check if it's a valid phone number (10-15 digits)
  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    return 'Please enter a valid phone number'
  }

  return null
}

/**
 * Validate password strength
 * @param {string} password - Password string
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null
 */
export const validatePassword = (password, options = {}) => {
  const {
    required = false,
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false
  } = options

  if (!password) {
    return required ? 'Password is required' : null
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }

  if (requireNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number'
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }

  return null
}

/**
 * Validate that two fields match (e.g., password confirmation)
 * @param {string} value1 - First value
 * @param {string} value2 - Second value
 * @param {string} label - Field label for error message
 * @returns {string|null} Error message or null
 */
export const validateMatch = (value1, value2, label = 'Password') => {
  if (value1 !== value2) {
    return `${label}s do not match`
  }
  return null
}

/**
 * Validate numeric value
 * @param {number|string} value - Numeric value
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null
 */
export const validateNumber = (value, options = {}) => {
  const {
    required = false,
    min = null,
    max = null,
    integer = false,
    positive = false,
    label = 'Value'
  } = options

  if (value === null || value === undefined || value === '') {
    return required ? `${label} is required` : null
  }

  const num = Number(value)

  if (isNaN(num)) {
    return `${label} must be a number`
  }

  if (integer && !Number.isInteger(num)) {
    return `${label} must be a whole number`
  }

  if (positive && num <= 0) {
    return `${label} must be positive`
  }

  if (min !== null && num < min) {
    return `${label} must be at least ${min}`
  }

  if (max !== null && num > max) {
    return `${label} must be at most ${max}`
  }

  return null
}

/**
 * Validate appointment date/time combination
 * @param {string} date - Date string
 * @param {string} time - Time string
 * @returns {Object} Validation errors object
 */
export const validateAppointmentDateTime = (date, time) => {
  const errors = {}

  if (!date) {
    errors.date = 'Date is required'
  }

  if (!time) {
    errors.time = 'Time is required'
  }

  if (date && time) {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()

    if (appointmentDateTime <= now) {
      errors.time = 'Appointment must be scheduled for a future time'
    }
  }

  return errors
}

/**
 * Bulk form validation helper
 * Runs multiple validation rules and combines errors
 * 
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules object
 * @returns {Object} Combined errors object
 * 
 * Example:
 * const rules = {
 *   email: (value) => validateEmail(value) ? null : 'Invalid email',
 *   phone: (value) => validatePhone(value, true),
 *   password: (value) => validatePassword(value, { minLength: 8 })
 * }
 * const errors = validateForm(formData, rules)
 */
export const validateForm = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach(field => {
    const validator = rules[field]
    const error = validator(data[field], data)
    if (error) {
      errors[field] = error
    }
  })

  return errors
}
