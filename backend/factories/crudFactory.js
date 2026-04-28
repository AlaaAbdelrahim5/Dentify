const prisma = require('../config/database');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../helpers/response');

/**
 * Generic CRUD Factory for common database operations
 * Reduces code duplication across route files
 */

/**
 * Get statistics for a model (total, active, inactive counts)
 * @param {string} modelName - Prisma model name (e.g., 'admin', 'dentist')
 * @param {string} role - User role for filtering (optional)
 * @param {boolean} useUserCount - Whether to count users instead of model records
 */
const getStats = async (modelName, role = null, useUserCount = false) => {
  try {
    let total, active, inactive;

    if (useUserCount && role) {
      // Count users by role
      total = await prisma.user.count({
        where: { role }
      });

      active = await prisma.user.count({
        where: { role, status: 'ACTIVE' }
      });

      inactive = await prisma.user.count({
        where: {
          role,
          status: { in: ['PENDING', 'DEACTIVATED'] }
        }
      });
    } else {
      // Count model records
      total = await prisma[modelName].count();

      active = await prisma.user.count({
        where: {
          role: role || modelName.charAt(0).toUpperCase() + modelName.slice(1),
          status: 'ACTIVE'
        }
      });

      inactive = await prisma.user.count({
        where: {
          role: role || modelName.charAt(0).toUpperCase() + modelName.slice(1),
          status: { in: ['PENDING', 'DEACTIVATED'] }
        }
      });
    }

    // Return with 'pending' as alias for inactive (frontend compatibility)
    return { total, active, inactive, pending: inactive };
  } catch (error) {
    throw new Error(`Failed to fetch ${modelName} statistics: ${error.message}`);
  }
};

/**
 * Get current user's profile
 * @param {number} userId - User ID from authentication
 * @param {string} modelName - Prisma model name
 * @param {Object} includeOptions - Prisma include options
 */
const getCurrentProfile = async (userId, modelName, includeOptions = {}) => {
  try {
    const defaultInclude = {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          status: true,
          profileImage: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }
    };

    const profile = await prisma[modelName].findUnique({
      where: { userId },
      include: { ...defaultInclude, ...includeOptions }
    });

    return profile;
  } catch (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
};

/**
 * Toggle user status between ACTIVE and DEACTIVATED
 * @param {number} userId - User ID to toggle
 * @param {string} modelName - Model name for validation
 */
const toggleStatus = async (userId, modelName) => {
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Toggle status
    const newStatus = user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    });

    return newStatus;
  } catch (error) {
    throw new Error(`Failed to toggle status: ${error.message}`);
  }
};

/**
 * Soft delete a user by setting status to DELETED
 * @param {number} userId - User ID to delete
 * @param {string} modelName - Model name for validation
 */
const softDelete = async (userId, modelName) => {
  try {
    // Check if record exists
    const record = await prisma[modelName].findUnique({
      where: { userId }
    });

    if (!record) {
      throw new Error(`${modelName} not found`);
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DELETED' }
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete: ${error.message}`);
  }
};

/**
 * Get record by ID
 * @param {number} id - Record ID (userId)
 * @param {string} modelName - Prisma model name
 * @param {Object} includeOptions - Prisma include options
 */
const getById = async (id, modelName, includeOptions = {}) => {
  try {
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

    const record = await prisma[modelName].findUnique({
      where: { userId: parseInt(id) },
      include: { ...defaultInclude, ...includeOptions }
    });

    return record;
  } catch (error) {
    throw new Error(`Failed to fetch record: ${error.message}`);
  }
};

/**
 * Build search query for common fields
 * @param {string} search - Search term
 * @param {Array} searchFields - Fields to search in
 */
const buildSearchQuery = (search, searchFields) => {
  if (!search) return {};

  const orConditions = [];

  searchFields.forEach(field => {
    if (field.includes('.')) {
      // Nested field like 'user.email'
      const [relation, fieldName] = field.split('.');
      orConditions.push({
        [relation]: {
          [fieldName]: { contains: search, mode: 'insensitive' }
        }
      });
    } else {
      // Direct field
      orConditions.push({
        [field]: { contains: search, mode: 'insensitive' }
      });
    }
  });

  return { OR: orConditions };
};

module.exports = {
  getStats,
  getCurrentProfile,
  toggleStatus,
  softDelete,
  getById,
  buildSearchQuery
};
