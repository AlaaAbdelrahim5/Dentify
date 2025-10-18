// API Response Helper Functions
// Standardized response format for all API endpoints

/**
 * Success response with data
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Success response with pagination
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination info
 * @param {string} message - Optional success message
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages
    }
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const errorResponse = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: error || 'An error occurred'
  });
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that wasn't found
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    error: `${resource} not found`
  });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    errors
  });
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Optional message
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    error: message
  });
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Optional message
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    error: message
  });
};

/**
 * Calculate pagination info
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} Pagination object
 */
const calculatePagination = (page, limit, total) => {
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages,
    skip,
    hasNext: page < pages,
    hasPrev: page > 1
  };
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  calculatePagination
};
