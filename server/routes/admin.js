const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../utils/responseHelper');
const bcrypt = require('bcryptjs');

// Get admin statistics
router.get('/stats', authenticate, authorize('Admin'), async (req, res) => {
  try {
    // Get total admins
    const total = await prisma.admin.count();
    
    // Get active admins
    const active = await prisma.admin.count({
      where: {
        user: {
          status: 'ACTIVE'
        }
      }
    });
    
    // Get deleted admins
    const deleted = await prisma.admin.count({
      where: {
        user: {
          status: 'DELETED'
        }
      }
    });

    const stats = {
      total,
      active,
      deleted
    };

    return successResponse(res, stats, 'Admin statistics fetched successfully');
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return errorResponse(res, 'Failed to fetch admin statistics');
  }
});

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
    console.error('Error fetching admins:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return errorResponse(res, 'Failed to fetch admins');
  }
});

// Get admin by ID
router.get('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await prisma.admin.findUnique({
      where: { userId: parseInt(id) },
      include: {
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
      }
    });

    if (!admin) {
      return notFoundResponse(res, 'Admin');
    }

    return successResponse(res, admin, 'Admin fetched successfully');
  } catch (error) {
    console.error('Error fetching admin:', error);
    return errorResponse(res, 'Failed to fetch admin');
  }
});

// Create new admin
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, gender } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return errorResponse(res, 'Email, password, first name, and last name are required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize gender value to match enum (capitalize first letter)
    const normalizedGender = gender 
      ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
      : null;

    // Create user and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone,
          role: 'Admin',
          status: 'ACTIVE'
        }
      });

      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          gender: normalizedGender
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              status: true,
              profileImage: true
            }
          }
        }
      });

      return admin;
    });

    return successResponse(res, result, 'Admin created successfully', 201);
  } catch (error) {
    console.error('Error creating admin:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return errorResponse(res, 'Failed to create admin');
  }
});

// Update admin
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

    // Normalize gender value to match enum (capitalize first letter)
    const normalizedGender = gender 
      ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
      : undefined;

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user info if provided
      if (email || phone) {
        await tx.user.update({
          where: { id: parseInt(id) },
          data: {
            ...(email && { email }),
            ...(phone && { phone })
          }
        });
      }

      // Update admin info
      const admin = await tx.admin.update({
        where: { userId: parseInt(id) },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(normalizedGender && { gender: normalizedGender })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              status: true,
              profileImage: true
            }
          }
        }
      });

      return admin;
    });

    return successResponse(res, result, 'Admin updated successfully');
  } catch (error) {
    console.error('Error updating admin:', error);
    return errorResponse(res, 'Failed to update admin');
  }
});

// Delete admin (soft delete by changing status)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingAdmin) {
      return notFoundResponse(res, 'Admin');
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'DELETED' }
    });

    return successResponse(res, null, 'Admin deleted successfully');
  } catch (error) {
    console.error('Error deleting admin:', error);
    return errorResponse(res, 'Failed to delete admin');
  }
});

module.exports = router;
