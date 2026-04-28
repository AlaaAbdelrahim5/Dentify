const { successResponse, errorResponse, notFoundResponse, paginatedResponse, calculatePagination } = require('../helpers/response');
const { getStats, getCurrentProfile, toggleStatus, softDelete, getById } = require('./crudFactory');
const { buildWhereClause, buildStatusFilter } = require('../utils/queryHelpers');
const { createUserWithProfile, updateUserWithProfile } = require('../services/user/userService');
const prisma = require('../config/database');

/**
 * Reusable Route Handlers
 * Generic handlers for common CRUD operations
 */

/**
 * Create a stats route handler
 * @param {string} modelName - Prisma model name
 * @param {string} role - User role (optional)
 * @param {boolean} useUserCount - Whether to count users instead of model records
 */
const createStatsHandler = (modelName, role = null, useUserCount = false) => {
  return async (req, res) => {
    try {
      const stats = await getStats(modelName, role, useUserCount);
      return successResponse(res, stats, `${modelName} statistics fetched successfully`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create a "get current profile" route handler
 * @param {string} modelName - Prisma model name
 * @param {Object} includeOptions - Additional Prisma include options
 */
const createGetProfileHandler = (modelName, includeOptions = {}) => {
  return async (req, res) => {
    try {
      const profile = await getCurrentProfile(req.user.id, modelName, includeOptions);

      if (!profile) {
        return notFoundResponse(res, `${modelName} profile`);
      }

      return successResponse(res, profile, `${modelName} profile fetched successfully`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create a toggle status route handler
 * @param {string} modelName - Prisma model name
 * @param {string} resourceName - Display name for the resource
 */
const createToggleStatusHandler = (modelName, resourceName) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Check if record exists
      const record = await prisma[modelName].findUnique({
        where: { userId }
      });

      if (!record) {
        return notFoundResponse(res, resourceName);
      }

      const newStatus = await toggleStatus(userId, modelName);
      const message = newStatus === 'ACTIVE' 
        ? `${resourceName} activated successfully` 
        : `${resourceName} deactivated successfully`;

      return successResponse(res, { status: newStatus }, message);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create a soft delete route handler
 * @param {string} modelName - Prisma model name
 * @param {string} resourceName - Display name for the resource
 */
const createDeleteHandler = (modelName, resourceName) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      await softDelete(parseInt(id), modelName);
      return successResponse(res, null, `${resourceName} deleted successfully`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create a "get by ID" route handler
 * @param {string} modelName - Prisma model name
 * @param {string} resourceName - Display name for the resource
 * @param {Object} includeOptions - Additional Prisma include options
 */
const createGetByIdHandler = (modelName, resourceName, includeOptions = {}) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      const record = await getById(id, modelName, includeOptions);

      if (!record) {
        return notFoundResponse(res, resourceName);
      }

      return successResponse(res, record, `${resourceName} fetched successfully`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create a list route handler with pagination and filtering
 * @param {string} modelName - Prisma model name
 * @param {Object} options - Configuration options
 * @param {Array} options.searchFields - Fields to search in
 * @param {Object} options.includeOptions - Prisma include options
 * @param {Function} options.transformFn - Optional transform function for results
 * @param {Object} options.defaultFilters - Default filters to apply
 */
const createListHandler = (modelName, options = {}) => {
  return async (req, res) => {
    try {
      const {
        searchFields = [],
        includeOptions = {},
        transformFn = null,
        defaultFilters = {},
        orderBy = { user: { createdAt: 'desc' } }
      } = options;

      const { page = 1, limit = 10, search = '', city = '', status = '', isActive = '' } = req.query;

      // Build where clause
      const whereClause = buildWhereClause({
        search,
        searchFields,
        city,
        status,
        customFilters: defaultFilters
      });

      // Apply isActive filter if provided
      if (isActive) {
        const statusFilter = buildStatusFilter(isActive);
        if (statusFilter) {
          if (whereClause.AND) {
            whereClause.AND.push(statusFilter);
          } else {
            whereClause.AND = [statusFilter];
          }
        }
      }

      // Final where clause
      const finalWhere = whereClause.AND && whereClause.AND.length > 0 ? whereClause : {};

      // Get total count
      const total = await prisma[modelName].count({ where: finalWhere });

      // Calculate pagination
      const pagination = calculatePagination(page, limit, total);

      // Default include options
      const defaultInclude = {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true
          }
        }
      };

      // Fetch records
      const records = await prisma[modelName].findMany({
        where: finalWhere,
        skip: pagination.skip,
        take: pagination.limit,
        include: { ...defaultInclude, ...includeOptions },
        orderBy
      });

      // Transform results if transform function provided
      const transformedRecords = transformFn ? records.map(transformFn) : records;

      return paginatedResponse(res, transformedRecords, pagination, `${modelName} fetched successfully`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create a POST handler for creating user with profile
 * @param {string} modelName - Prisma model name
 * @param {string} role - User role
 * @param {Array} requiredFields - Required field names
 * @param {Object} includeOptions - Prisma include options
 */
const createUserProfileHandler = (modelName, role, requiredFields, includeOptions = {}) => {
  return async (req, res) => {
    try {
      const data = req.body;

      // Validate required fields
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        return errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      // Separate user and profile data
      const { email, password, phone } = data;
      const userData = { email, password, phone, role, status: data.status || 'ACTIVE' };
      
      // Remove user fields from profile data
      const profileData = { ...data };
      delete profileData.email;
      delete profileData.password;
      delete profileData.phone;
      delete profileData.status;
      delete profileData.role;

      // Create user with profile
      const result = await createUserWithProfile(userData, profileData, modelName, includeOptions);

      return successResponse(res, result, `${modelName} created successfully`, 201);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, error.message);
    }
  };
};

/**
 * Create an update profile handler
 * @param {string} modelName - Prisma model name
 * @param {string} resourceName - Display name for the resource
 * @param {Object} includeOptions - Prisma include options
 */
const createUpdateProfileHandler = (modelName, resourceName, includeOptions = {}) => {
  return async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Separate user and profile fields
      const userFields = ['email', 'phone', 'password', 'profileImage'];
      const userData = {};
      const profileData = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (userFields.includes(key)) {
            userData[key] = value;
          } else {
            profileData[key] = value;
          }
        }
      });

      // Update user and profile
      const result = await updateUserWithProfile(userId, userData, profileData, modelName, includeOptions);

      return successResponse(res, result, `${resourceName} updated successfully`);
    } catch (error) {
      if (error.code === 'P2002') {
        return errorResponse(res, 'Email already exists', 400);
      }
      return errorResponse(res, error.message);
    }
  };
};

module.exports = {
  createStatsHandler,
  createGetProfileHandler,
  createToggleStatusHandler,
  createDeleteHandler,
  createGetByIdHandler,
  createListHandler,
  createUserProfileHandler,
  createUpdateProfileHandler
};
