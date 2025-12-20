/**
 * Form validation utility functions
 * DEPRECATED: This file now re-exports from validation.js
 * All validation logic has been consolidated into validation.js
 * This file is kept for backward compatibility
 */

// Re-export all validation utilities from validation.js
export {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePhone,
  validatePassword,
  validateAge,
  validateRequired,
  validateArrayNotEmpty,
  validateNumberRange,
  validationRules,
  validateForm,
  validators
} from './validation'
