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
