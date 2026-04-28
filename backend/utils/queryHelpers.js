/**
 * Consolidated Query Helpers
 * All query building utilities in one place
 */

/**
 * Build search filter for multiple fields with OR condition
 * @param {string} search - Search term
 * @param {Array<string|Object>} fields - Array of field paths or objects with 'contains' queries
 * @returns {Object} Prisma OR query object
 */
function buildSearchFilter(search, fields) {
  if (!search) return null;

  const orConditions = fields.map(field => {
    if (typeof field === 'string') {
      if (field.includes('.')) {
        // Nested field like 'user.email'
        const parts = field.split('.');
        let condition = { [parts[parts.length - 1]]: { contains: search, mode: 'insensitive' } };
        
        // Build nested structure
        for (let i = parts.length - 2; i >= 0; i--) {
          condition = { [parts[i]]: condition };
        }
        return condition;
      } else {
        // Simple field like 'firstName'
        return { [field]: { contains: search, mode: 'insensitive' } };
      }
    } else {
      // Custom object condition
      return field;
    }
  });

  return { OR: orConditions };
}

/**
 * Build pagination parameters
 * @param {number|string} page - Page number (default: 1)
 * @param {number|string} limit - Items per page (default: 10)
 * @returns {Object} { skip, take }
 */
function buildPagination(page = 1, limit = 10) {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum
  };
}

/**
 * Build where clause with common filters
 * @param {Object} options - Filter options
 * @param {string} options.search - Search term
 * @param {Array} options.searchFields - Fields to search in
 * @param {string} options.city - City filter
 * @param {string} options.status - Status filter
 * @param {string} options.isActive - Active status filter ('true', 'false')
 * @param {Object} options.customFilters - Additional custom filters
 * @returns {Object} Prisma where clause
 */
function buildWhereClause(options = {}) {
  const { search, searchFields = [], city, status, isActive, customFilters = {} } = options;
  
  const whereClause = { AND: [] };

  // Search filter
  if (search && searchFields.length > 0) {
    const searchFilter = buildSearchFilter(search, searchFields);
    if (searchFilter) {
      whereClause.AND.push(searchFilter);
    }
  }

  // City filter
  if (city) {
    whereClause.AND.push({
      city: { contains: city, mode: 'insensitive' }
    });
  }

  // Status filter
  if (status) {
    const statusMap = {
      'pending': 'PENDING',
      'active': 'ACTIVE',
      'suspended': 'DEACTIVATED',
      'deactivated': 'DEACTIVATED',
      'inactive': 'DEACTIVATED',
      'deleted': 'DELETED'
    };
    
    const mappedStatus = statusMap[status.toLowerCase()] || status.toUpperCase();
    whereClause.AND.push({ user: { status: mappedStatus } });
  }

  // Active/Inactive filter
  if (isActive === 'true') {
    whereClause.AND.push({ user: { status: 'ACTIVE' } });
  } else if (isActive === 'false') {
    whereClause.AND.push({
      user: {
        status: { in: ['PENDING', 'DEACTIVATED', 'DELETED'] }
      }
    });
  }

  // Add custom filters
  if (Object.keys(customFilters).length > 0) {
    Object.entries(customFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        whereClause.AND.push({ [key]: value });
      }
    });
  }

  // Return empty object if no filters, otherwise return whereClause
  return whereClause.AND.length > 0 ? whereClause : {};
}

/**
 * Build status filter for active/inactive users
 * @param {string} isActive - 'true', 'false', or empty
 */
function buildStatusFilter(isActive) {
  if (isActive === 'true') {
    return { user: { status: 'ACTIVE' } };
  } else if (isActive === 'false') {
    return {
      user: {
        status: { in: ['PENDING', 'DEACTIVATED', 'DELETED'] }
      }
    };
  }
  return null;
}

/**
 * Standard user select fields for including in queries
 */
const standardUserSelect = {
  id: true,
  email: true,
  phone: true,
  status: true,
  profileImage: true,
  createdAt: true,
  updatedAt: true
};

/**
 * Minimal user select fields
 */
const minimalUserSelect = {
  id: true,
  email: true,
  phone: true
};

/**
 * Standard user include with select
 */
const standardUserInclude = {
  user: {
    select: standardUserSelect
  }
};

module.exports = {
  buildSearchFilter,
  buildPagination,
  buildWhereClause,
  buildStatusFilter,
  standardUserSelect,
  minimalUserSelect,
  standardUserInclude
};
