import { useState, useCallback } from 'react'
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateAge,
  validateRequired,
  validationRules
} from '../utils/validation'

/**
 * Custom hook for form validation with common validation patterns
 * Eliminates duplicate validation logic across modal components
 * 
 * @param {Object} validationSchema - Validation schema defining rules for each field
 * @param {Object} formData - Current form data to validate
 * @param {boolean} isEditMode - Whether form is in edit mode (affects password validation)
 * 
 * @returns {Object} Object containing errors, validateForm, clearError, setErrors
 * 
 * @example
 * const schema = {
 *   firstName: [{ rule: 'required', message: 'First name is required' }],
 *   email: [
 *     { rule: 'required', message: 'Email is required' },
 *     { rule: 'email' }
 *   ],
 *   birthDate: [
 *     { rule: 'required', message: 'Birth date is required' },
 *     { rule: 'age', params: [18], message: 'Must be at least 18 years old' }
 *   ]
 * }
 * const { errors, validateForm } = useFormValidation(schema, formData)
 */
export const useFormValidation = (validationSchema = {}, formData = {}, isEditMode = false) => {
  const [errors, setErrors] = useState({})

  /**
   * Validate form based on the provided schema
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = useCallback(() => {
    const newErrors = {}

    Object.keys(validationSchema).forEach(field => {
      const rules = validationSchema[field]
      const value = formData[field]

      for (const ruleConfig of rules) {
        const { rule, message, params = [], skipInEditMode = false } = ruleConfig

        // Skip validation if in edit mode and rule should be skipped
        if (isEditMode && skipInEditMode) {
          continue
        }

        let error = null

        // Handle different validation types
        switch (rule) {
          case 'required':
            error = validateRequired(value, field)
            break

          case 'email':
            if (value) { // Only validate if value exists
              error = validateEmail(value)
            }
            break

          case 'phone':
            if (value) { // Only validate if value exists
              error = validatePhone(value)
            }
            break

          case 'password':
            error = validatePassword(value, params[0] !== false)
            break

          case 'age':
            if (value) { // Only validate if value exists
              error = validateAge(value, params[0] || 18)
            }
            break

          case 'minLength':
            if (value && value.length < params[0]) {
              error = `${field} must be at least ${params[0]} characters`
            }
            break

          case 'arrayNotEmpty':
            if (!Array.isArray(value) || value.length === 0) {
              error = `At least one ${field} is required`
            }
            break

          case 'custom':
            // Custom validation function
            if (params[0] && typeof params[0] === 'function') {
              error = params[0](value, formData)
            }
            break

          default:
            // Use validation rules from utils if available
            if (validationRules[rule]) {
              error = validationRules[rule](value, ...params, field)
            }
        }

        if (error) {
          newErrors[field] = message || error
          break // Stop at first error for this field
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [validationSchema, formData, isEditMode])

  /**
   * Clear error for a specific field
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
   * Set a specific error
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  const setError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  return {
    errors,
    validateForm,
    clearError,
    clearErrors,
    setError,
    setErrors
  }
}

/**
 * Predefined validation schemas for common form patterns
 * Use these to quickly set up validation for standard forms
 */
export const commonSchemas = {
  /**
   * Person schema (for patients, dentists, secretaries, admins)
   * @param {boolean} includePassword - Whether to include password validation
   * @param {number} minimumAge - Minimum age requirement (default: 18)
   * @param {Array} additionalFields - Additional required fields
   */
  person: (includePassword = true, minimumAge = 18, additionalFields = []) => ({
    firstName: [{ rule: 'required', message: 'First name is required' }],
    lastName: [{ rule: 'required', message: 'Last name is required' }],
    email: [
      { rule: 'required', message: 'Email is required' },
      { rule: 'email' }
    ],
    phone: [
      { rule: 'required', message: 'Phone is required' },
      { rule: 'phone' }
    ],
    birthDate: [
      { rule: 'required', message: 'Birth date is required' },
      { rule: 'age', params: [minimumAge] }
    ],
    gender: [{ rule: 'required', message: 'Gender is required' }],
    city: [{ rule: 'required', message: 'City is required' }],
    ...(includePassword && {
      password: [
        { rule: 'required', message: 'Password is required', skipInEditMode: true },
        { rule: 'password', params: [true], skipInEditMode: true }
      ]
    }),
    // Add any additional fields
    ...additionalFields.reduce((acc, field) => {
      acc[field] = [{ rule: 'required', message: `${field} is required` }]
      return acc
    }, {})
  }),

  /**
   * Appointment schema
   */
  appointment: {
    patientId: [{ rule: 'required', message: 'Patient is required' }],
    dentistId: [{ rule: 'required', message: 'Dentist is required' }],
    appointmentDate: [{ rule: 'required', message: 'Date is required' }],
    startTime: [{ rule: 'required', message: 'Start time is required' }],
    duration: [{ rule: 'required', message: 'Duration is required' }]
  },

  /**
   * Treatment schema
   */
  treatment: {
    treatmentName: [{ rule: 'required', message: 'Treatment name is required' }],
    patientId: [{ rule: 'required', message: 'Patient is required' }],
    totalAmount: [
      { rule: 'required', message: 'Total amount is required' },
      { rule: 'number' }
    ]
  },

  /**
   * Payment schema
   */
  payment: {
    amount: [
      { rule: 'required', message: 'Amount is required' },
      { rule: 'min', params: [0.01] }
    ],
    paymentMethod: [{ rule: 'required', message: 'Payment method is required' }]
  }
}

/**
 * Hook for person-specific validation (patients, dentists, secretaries)
 * Provides ready-to-use validation for common person forms
 * 
 * @param {Object} formData - Form data
 * @param {boolean} isEditMode - Whether in edit mode
 * @param {number} minimumAge - Minimum age requirement
 * @param {Array} additionalFields - Additional required fields
 * 
 * @example
 * const { errors, validateForm } = usePersonValidation(formData, isEditMode, 22, ['licenseNumber'])
 */
export const usePersonValidation = (
  formData = {},
  isEditMode = false,
  minimumAge = 18,
  additionalFields = []
) => {
  const schema = commonSchemas.person(true, minimumAge, additionalFields)
  return useFormValidation(schema, formData, isEditMode)
}

export default useFormValidation
