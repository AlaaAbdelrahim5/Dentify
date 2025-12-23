const prisma = require('../config/database');

/**
 * Check if a user with the given email already exists
 * @param {string} email - Email to check
 * @param {number} excludeUserId - Optional user ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if user exists
 */
const checkUserExists = async (email, excludeUserId = null) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser && (!excludeUserId || existingUser.id !== excludeUserId)) {
    return true;
  }

  return false;
};

/**
 * Normalize gender value to match enum (capitalize first letter)
 * @param {string} gender - Gender value to normalize
 * @returns {string|null} Normalized gender or null
 */
const normalizeGender = (gender) => {
  if (!gender) return null;
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
};

/**
 * Validate required fields
 * @param {Object} fields - Object with field names as keys and values to check
 * @returns {Object} { isValid: boolean, missing: string[] }
 */
const validateRequiredFields = (fields) => {
  const missing = [];
  
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(key);
    }
  }

  return {
    isValid: missing.length === 0,
    missing
  };
};

/**
 * Check if entity exists in database
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Prisma model name (e.g., 'patient', 'dentist')
 * @param {number|string} id - Entity ID
 * @param {string} idField - Field name for the ID (default: 'id')
 * @returns {Promise<Object|null>} Entity object or null if not found
 */
const checkEntityExists = async (prisma, model, id, idField = 'id') => {
  try {
    const entity = await prisma[model].findUnique({
      where: { [idField]: parseInt(id) }
    });
    return entity;
  } catch (error) {
    return null;
  }
};

/**
 * Validate entity exists and return error response if not found
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Prisma model name
 * @param {number|string} id - Entity ID
 * @param {string} entityName - Human-readable entity name for error message
 * @param {Object} res - Express response object
 * @param {string} idField - Field name for the ID (default: 'id')
 * @returns {Promise<Object|null>} Entity if found, null if not found (and sends error response)
 */
const validateEntityExists = async (prisma, model, id, entityName, res, idField = 'id') => {
  const entity = await checkEntityExists(prisma, model, id, idField);
  
  if (!entity) {
    res.status(404).json({ 
      error: `${entityName} not found` 
    });
    return null;
  }
  
  return entity;
};

module.exports = {
  checkUserExists,
  normalizeGender,
  validateRequiredFields,
  checkEntityExists,
  validateEntityExists
};
