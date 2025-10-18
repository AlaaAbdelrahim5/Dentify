const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../utils/responseHelper');

// Get dentists statistics
router.get('/stats', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const total = await prisma.dentist.count();
    const pending = await prisma.user.count({
      where: {
        role: 'Dentist',
        status: 'PENDING'
      }
    });
    const active = await prisma.user.count({
      where: {
        role: 'Dentist',
        status: 'ACTIVE'
      }
    });

    res.json({ 
      data: {
        total,
        pending,
        active
      }
    });
  } catch (error) {
    console.error('Error fetching dentist stats:', error);
    res.status(500).json({ error: 'Failed to fetch dentist statistics' });
  }
});

// Get all dentists with pagination and filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      city = '', 
      status = '', 
      specialization = '',
      includeAll = 'false'
    } = req.query;
    
    // Build where clause
    const whereClause = {
      AND: []
    };

    // Search filter
    if (search) {
      whereClause.AND.push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { licenseNumber: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }

    // City filter
    if (city) {
      whereClause.AND.push({ city: { contains: city, mode: 'insensitive' } });
    }

    // Status filter
    if (status) {
      const statusMap = {
        'pending': 'PENDING',
        'active': 'ACTIVE',
        'suspended': 'DEACTIVATED'
      };
      whereClause.AND.push({ user: { status: statusMap[status] || status.toUpperCase() } });
    } else if (includeAll !== 'true') {
      // By default, only show active dentists if not admin
      whereClause.AND.push({ user: { status: 'ACTIVE' } });
    }

    // Specialization filter
    if (specialization) {
      whereClause.AND.push({ 
        specialization: {
          has: specialization
        }
      });
    }

    // If no filters, remove AND array
    const finalWhere = whereClause.AND.length > 0 ? whereClause : {};

    // Get total count
    const total = await prisma.dentist.count({ where: finalWhere });
    
    // Calculate pagination
    const pagination = calculatePagination(page, limit, total);

    // Fetch dentists
    const dentists = await prisma.dentist.findMany({
      where: finalWhere,
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
        },
        clinic: {
          select: {
            userId: true,
            clinicName: true,
            city: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return paginatedResponse(res, dentists, pagination, 'Dentists fetched successfully');
  } catch (error) {
    console.error('Error fetching dentists:', error);
    return errorResponse(res, 'Failed to fetch dentists');
  }
});

// Get dentist by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const dentist = await prisma.dentist.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true
          }
        },
        clinic: true
      }
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentist not found' });
    }

    res.json({ dentist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dentist' });
  }
});

// Update dentist
router.put('/:id', authenticate, authorize('Dentist', 'Clinic', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      specialization, 
      workingHours, 
      appointmentDuration,
      socialLinks 
    } = req.body;

    const dentist = await prisma.dentist.update({
      where: { userId: parseInt(id) },
      data: { 
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(specialization && { specialization }),
        ...(workingHours && { workingHours }),
        ...(appointmentDuration && { appointmentDuration }),
        ...(socialLinks && { socialLinks })
      },
      include: {
        user: true,
        clinic: true
      }
    });

    return successResponse(res, dentist, 'Dentist updated successfully');
  } catch (error) {
    console.error('Error updating dentist:', error);
    return errorResponse(res, 'Failed to update dentist');
  }
});

// Approve dentist (Admin only)
router.post('/:id/approve', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if dentist exists
    const dentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(id) },
      include: { user: true }
    });

    if (!dentist) {
      return notFoundResponse(res, 'Dentist');
    }

    // Update user status to ACTIVE
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'ACTIVE' }
    });

    return successResponse(res, null, 'Dentist approved successfully');
  } catch (error) {
    console.error('Error approving dentist:', error);
    return errorResponse(res, 'Failed to approve dentist');
  }
});

// Reject dentist (Admin only)
router.post('/:id/reject', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if dentist exists
    const dentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(id) },
      include: { user: true }
    });

    if (!dentist) {
      return notFoundResponse(res, 'Dentist');
    }

    // Update user status to DELETED or DEACTIVATED
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'DELETED' }
    });

    // TODO: Send rejection email with reason
    
    return successResponse(res, { reason }, 'Dentist rejected successfully');
  } catch (error) {
    console.error('Error rejecting dentist:', error);
    return errorResponse(res, 'Failed to reject dentist');
  }
});

// Delete dentist (soft delete)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if dentist exists
    const existingDentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingDentist) {
      return notFoundResponse(res, 'Dentist');
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'DELETED' }
    });

    return successResponse(res, null, 'Dentist deleted successfully');
  } catch (error) {
    console.error('Error deleting dentist:', error);
    return errorResponse(res, 'Failed to delete dentist');
  }
});

module.exports = router;
