const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../helpers/response');
const { createUserWithProfile, updateUserWithProfile } = require('../services/user/userService');
const {
  createStatsHandler,
  createGetProfileHandler,
  createToggleStatusHandler,
  createDeleteHandler,
  createGetByIdHandler
} = require('../factories/routeHandlers');
const { standardUserSelect } = require('../utils/queryHelpers');

// Get current admin profile - using reusable handler
router.get('/me', authenticate, authorize('Admin'), createGetProfileHandler('admin'));

// Get admin statistics - using reusable handler
router.get('/stats', authenticate, authorize('Admin'), createStatsHandler('admin', 'Admin'));

// Get all admins with pagination and search
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } }
      ]
    } : {};

    // Get total count
    const total = await prisma.admin.count({ where: whereClause });
    
    // Calculate pagination
    const pagination = calculatePagination(page, limit, total);

    // Fetch admins with pagination
    const admins = await prisma.admin.findMany({
      where: whereClause,
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        user: {
          select: standardUserSelect
        }
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    // Transform data to include userId as main id and fullName
    const transformedAdmins = admins.map(admin => ({
      _id: admin.userId,
      fullName: `${admin.firstName} ${admin.lastName}`,
      firstName: admin.firstName,
      lastName: admin.lastName,
      gender: admin.gender ? admin.gender.toLowerCase() : 'other',
      userId: {
        id: admin.user.id,
        email: admin.user.email,
        phone: admin.user.phone || '',
        status: admin.user.status ? admin.user.status.toLowerCase() : 'active',
        profileImage: admin.user.profileImage || null
      },
      createdAt: admin.user.createdAt,
      updatedAt: admin.user.updatedAt
    }));

    return paginatedResponse(res, transformedAdmins, pagination, 'Admins fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch admins');
  }
});

// Get admin by ID - using reusable handler
router.get('/:id', authenticate, authorize('Admin'), createGetByIdHandler('admin', 'Admin'));

// Create new admin - using consolidated user service
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, gender } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return errorResponse(res, 'Email, password, first name, and last name are required', 400);
    }

    // Prepare user and profile data
    const userData = { email, password, phone, role: 'Admin', status: 'ACTIVE' };
    const profileData = { firstName, lastName, gender };

    // Create user with profile using service
    const result = await createUserWithProfile(userData, profileData, 'admin');

    return successResponse(res, result, 'Admin created successfully', 201);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, 'Failed to create admin');
  }
});

// Update admin - using consolidated user service
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, gender, phone, email } = req.body;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingAdmin) {
      return notFoundResponse(res, 'Admin');
    }

    // Prepare update data
    const userData = {};
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const profileData = {};
    if (firstName) profileData.firstName = firstName;
    if (lastName) profileData.lastName = lastName;
    if (gender) profileData.gender = gender;

    // Update using service
    const result = await updateUserWithProfile(parseInt(id), userData, profileData, 'admin');

    return successResponse(res, result, 'Admin updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update admin');
  }
});

// Toggle admin status - using reusable handler
router.patch('/:id/toggle-status', authenticate, authorize('Admin'), createToggleStatusHandler('admin', 'Admin'));

// Delete admin - using reusable handler
router.delete('/:id', authenticate, authorize('Admin'), createDeleteHandler('admin', 'Admin'));

module.exports = router;
