/**
 * Validation utilities and regex patterns
 */

// Regular Expressions
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_REGEX = /^(\+970|0)?[0-9]{8,9}$/
export const PASSWORD_MIN_LENGTH = 6

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required'
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

/**
 * Validate Palestinian phone number
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required'
  }
  if (!PHONE_REGEX.test(phone)) {
    return 'Please enter a valid Palestinian phone number'
  }
  return null
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {boolean} isRequired - Whether password is required
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password, isRequired = true) => {
  if (isRequired && (!password || !password.trim())) {
    return 'Password is required'
  }
  if (password && password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
  }
  return null
}

/**
 * Validate age (must be at least minimum age)
 * @param {string|Date} birthDate - Birth date to validate
 * @param {number} minAge - Minimum required age (default: 18)
 * @returns {string|null} Error message or null if valid
 */
export const validateAge = (birthDate, minAge = 18) => {
  if (!birthDate) {
    return 'Birth date is required'
  }
  
  const today = new Date()
  const birth = new Date(birthDate)
  
  if (isNaN(birth.getTime())) {
    return 'Invalid birth date'
  }
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  if (age < minAge) {
    return `Must be at least ${minAge} years old`
  }
  
  return null
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value == null || value === '' || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate array has at least one item
 * @param {Array} array - Array to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateArrayNotEmpty = (array, fieldName = 'This field') => {
  if (!Array.isArray(array) || array.length === 0) {
    return `At least one ${fieldName} is required`
  }
  return null
}

/**
 * Validate number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
  const num = Number(value)
  if (isNaN(num)) {
    return `${fieldName} must be a number`
  }
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`
  }
  return null
}

/**
 * Validate required fields in form data
 * @param {Object} data - Form data object
 * @param {Array} requiredFields - Array of required field names or config objects
 * @returns {Object} Validation errors object
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
 * Common validation rules for different field types
 * Extended validation rule system for form validation
 */
export const validationRules = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`
    }
    return null
  },

  email: (value) => {
    if (!value) return null // Skip if empty (use required rule separately)
    return validateEmail(value)
  },

  phone: (value) => {
    if (!value) return null // Skip if empty (use required rule separately)
    return validatePhone(value)
  },

  password: (value, isRequired = false) => {
    if (!value && !isRequired) return null
    return validatePassword(value, isRequired)
  },

  age: (dateOfBirth, minimumAge = 18) => {
    if (!dateOfBirth) return null
    return validateAge(dateOfBirth, minimumAge)
  },

  minLength: (value, length, fieldName = 'This field') => {
    if (!value) return null
    if (value.length < length) {
      return `${fieldName} must be at least ${length} characters`
    }
    return null
  },

  maxLength: (value, length, fieldName = 'This field') => {
    if (!value) return null
    if (value.length > length) {
      return `${fieldName} must not exceed ${length} characters`
    }
    return null
  },

  number: (value, fieldName = 'This field') => {
    if (!value) return null
    if (isNaN(value)) {
      return `${fieldName} must be a valid number`
    }
    return null
  },

  min: (value, min, fieldName = 'This field') => {
    if (!value) return null
    if (Number(value) < min) {
      return `${fieldName} must be at least ${min}`
    }
    return null
  },

  max: (value, max, fieldName = 'This field') => {
    if (!value) return null
    if (Number(value) > max) {
      return `${fieldName} must not exceed ${max}`
    }
    return null
  }
}

/**
 * Validate a form based on schema
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Object with errors (empty if valid)
 * 
 * Schema format:
 * {
 *   fieldName: [
 *     { rule: 'required', message: 'Custom message' },
 *     { rule: 'email' },
 *     { rule: 'minLength', params: [5] }
 *   ]
 * }
 */
export const validateForm = (formData, schema) => {
  const errors = {}

  Object.keys(schema).forEach(fieldName => {
    const fieldRules = schema[fieldName]
    const fieldValue = formData[fieldName]

    for (const ruleConfig of fieldRules) {
      const { rule, message, params = [] } = ruleConfig
      
      // Get validation function
      const validationFn = validationRules[rule]
      if (!validationFn) {
        console.warn(`Unknown validation rule: ${rule}`)
        continue
      }

      // Run validation
      const error = validationFn(fieldValue, ...params, fieldName)
      
      if (error) {
        errors[fieldName] = message || error
        break // Stop at first error for this field
      }
    }
  })

  return errors
}

/**
 * Quick validation helpers for common patterns
 */
export const validators = {
  /**
   * Validate person (patient, dentist, secretary) basic fields
   */
  person: (formData, isEditMode = false) => {
    const errors = {}

    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) errors.email = emailError
    }
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone is required'
    } else {
      const phoneError = validatePhone(formData.phone)
      if (phoneError) errors.phone = phoneError
    }

    // Password required for new entries only
    if (!isEditMode) {
      const passwordError = validatePassword(formData.password, true)
      if (passwordError) errors.password = passwordError
    }

    return errors
  },

  /**
   * Validate date and age requirements
   */
  dateOfBirth: (dateOfBirth, minimumAge = 18) => {
    if (!dateOfBirth) {
      return 'Date of birth is required'
    }
    return validateAge(dateOfBirth, minimumAge)
  },

  /**
   * Validate required fields
   */
  requiredFields: (formData, fields) => {
    const errors = {}
    fields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }
    })
    return errors
  }
}
