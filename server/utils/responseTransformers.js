/**
 * Transform secretary data to match frontend expectations
 * @param {Object} secretary - Secretary object from database with user and clinic relations
 * @returns {Object} Transformed secretary object
 */
function transformSecretary(secretary) {
  const base = {
    _id: secretary.userId,
    firstName: secretary.firstName,
    lastName: secretary.lastName,
    birthDate: secretary.birthDate,
    gender: secretary.gender,
    clinicId: secretary.clinicId,
    userId: {
      id: secretary.user.id,
      email: secretary.user.email,
      phone: secretary.user.phone,
      status: secretary.user.status,
      profileImage: secretary.user.profileImage
    },
    createdAt: secretary.user.createdAt,
    updatedAt: secretary.user.updatedAt
  };

  // Add city based on structure
  if (secretary.city) {
    base.city = secretary.city;
    base.address = { city: secretary.city };
  }

  // Add clinic if present
  if (secretary.clinic) {
    base.clinic = {
      id: secretary.clinic.userId,
      clinicName: secretary.clinic.clinicName,
      registrationNumber: secretary.clinic.registrationNumber,
      city: secretary.clinic.city,
      contactNumber: secretary.clinic.user?.phone
    };
  }

  return base;
}

/**
 * Standard error handler for routes
 * Logs error and sends appropriate response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
function handleRouteError(res, error, defaultMessage = 'Operation failed', statusCode = 500) {
  console.error(`Error: ${defaultMessage}`, error);
  
  return res.status(statusCode).json({ 
    error: error.message || defaultMessage 
  });
}

/**
 * Standard success response with consistent format
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendSuccessResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

module.exports = {
  transformSecretary,
  handleRouteError,
  sendSuccessResponse
};
