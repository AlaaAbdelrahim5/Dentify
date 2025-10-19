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

// Get dentists for logged-in clinic (MUST BE BEFORE /:id route)
router.get('/clinic', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const clinicUserId = req.user.id;

    // Get all dentists belonging to this clinic
    const dentists = await prisma.dentist.findMany({
      where: {
        clinicId: clinicUserId
      },
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
            city: true
          }
        }
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    return successResponse(res, dentists, 'Dentists fetched successfully');
  } catch (error) {
    console.error('Error fetching clinic dentists:', error);
    return errorResponse(res, 'Failed to fetch dentists');
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

// Create dentist (Clinic creates dentist request)
router.post('/', authenticate, authorize('Clinic', 'Admin'), async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { 
      email, 
      password, 
      phone, 
      firstName, 
      lastName, 
      licenseNumber, 
      specialization, 
      birthDate, 
      gender, 
      city, 
      appointmentDuration = 30,
      workingHours = [],
      socialLinks = {}
    } = req.body;

    // Get clinic ID (if created by clinic, use their ID; if admin, use provided clinicId)
    const clinicId = req.user.role === 'Clinic' ? req.user.id : req.body.clinicId;

    if (!clinicId) {
      return errorResponse(res, 'Clinic ID is required', 400);
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !licenseNumber || !birthDate || !city) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'A user with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and dentist in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone,
          role: 'Dentist',
          status: 'PENDING' // Pending approval from admin
        }
      });

      // Create dentist profile
      const dentist = await tx.dentist.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          licenseNumber,
          specialization: specialization || [],
          birthDate: new Date(birthDate),
          gender,
          city,
          clinicId,
          appointmentDuration,
          workingHours,
          socialLinks
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true
            }
          },
          clinic: {
            select: {
              userId: true,
              clinicName: true,
              city: true
            }
          }
        }
      });

      return dentist;
    });

    return successResponse(res, result, 'Dentist request created successfully. Awaiting admin approval.', 201);
  } catch (error) {
    console.error('Error creating dentist:', error);
    return errorResponse(res, error.message || 'Failed to create dentist');
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
    const bcrypt = require('bcryptjs');
    const { id } = req.params;
    const { userData, dentistData } = req.body;

    const dentistUserId = parseInt(id);

    // Check if dentist exists
    const existingDentist = await prisma.dentist.findUnique({
      where: { userId: dentistUserId },
      include: { user: true, clinic: true }
    });

    if (!existingDentist) {
      return notFoundResponse(res, 'Dentist');
    }

    // Authorization check
    if (req.user.role === 'Clinic' && existingDentist.clinicId !== req.user.id) {
      return errorResponse(res, 'Unauthorized to update this dentist', 403);
    }

    if (req.user.role === 'Dentist' && dentistUserId !== req.user.id) {
      return errorResponse(res, 'Unauthorized to update this dentist', 403);
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user data if provided
      if (userData) {
        const userUpdateData = {};
        if (userData.email) userUpdateData.email = userData.email;
        if (userData.phone) userUpdateData.phone = userData.phone;
        if (userData.password) {
          userUpdateData.password = await bcrypt.hash(userData.password, 10);
        }

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: dentistUserId },
            data: userUpdateData
          });
        }
      }

      // Update dentist data if provided
      if (dentistData) {
        const dentistUpdateData = {};
        if (dentistData.firstName) dentistUpdateData.firstName = dentistData.firstName;
        if (dentistData.lastName) dentistUpdateData.lastName = dentistData.lastName;
        if (dentistData.licenseNumber) dentistUpdateData.licenseNumber = dentistData.licenseNumber;
        if (dentistData.specialization) dentistUpdateData.specialization = dentistData.specialization;
        if (dentistData.birthDate) dentistUpdateData.birthDate = new Date(dentistData.birthDate);
        if (dentistData.gender) dentistUpdateData.gender = dentistData.gender;
        if (dentistData.city) dentistUpdateData.city = dentistData.city;
        if (dentistData.appointmentDuration !== undefined) dentistUpdateData.appointmentDuration = dentistData.appointmentDuration;
        if (dentistData.workingHours) dentistUpdateData.workingHours = dentistData.workingHours;
        if (dentistData.socialLinks) dentistUpdateData.socialLinks = dentistData.socialLinks;

        if (Object.keys(dentistUpdateData).length > 0) {
          await tx.dentist.update({
            where: { userId: dentistUserId },
            data: dentistUpdateData
          });
        }
      }

      // Fetch updated dentist
      const updatedDentist = await tx.dentist.findUnique({
        where: { userId: dentistUserId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true,
              updatedAt: true
            }
          },
          clinic: {
            select: {
              userId: true,
              clinicName: true,
              city: true
            }
          }
        }
      });

      return updatedDentist;
    });

    return successResponse(res, result, 'Dentist updated successfully');
  } catch (error) {
    console.error('Error updating dentist:', error);
    return errorResponse(res, error.message || 'Failed to update dentist');
  }
});

// Delete dentist (Clinic or Admin can delete)
router.delete('/:id', authenticate, authorize('Clinic', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const dentistUserId = parseInt(id);

    // Check if dentist exists
    const existingDentist = await prisma.dentist.findUnique({
      where: { userId: dentistUserId },
      include: { clinic: true }
    });

    if (!existingDentist) {
      return notFoundResponse(res, 'Dentist');
    }

    // Authorization check for clinics
    if (req.user.role === 'Clinic' && existingDentist.clinicId !== req.user.id) {
      return errorResponse(res, 'Unauthorized to delete this dentist', 403);
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: dentistUserId },
      data: { status: 'DELETED' }
    });

    return successResponse(res, null, 'Dentist deleted successfully');
  } catch (error) {
    console.error('Error deleting dentist:', error);
    return errorResponse(res, 'Failed to delete dentist');
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

// Toggle dentist status (Admin and Clinic can toggle between ACTIVE and DEACTIVATED)
router.patch('/:id/toggle-status', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
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

    // If Clinic is making the request, verify they own this dentist
    if (req.user.role === 'Clinic' && dentist.clinicId !== req.user.id) {
      return errorResponse(res, 'You can only toggle status for your own dentists', 403);
    }

    // Can only toggle if status is ACTIVE or DEACTIVATED (not PENDING or DELETED)
    if (dentist.user.status === 'PENDING') {
      return errorResponse(res, 'Cannot toggle status for pending dentists. Please approve first.', 400);
    }

    if (dentist.user.status === 'DELETED') {
      return errorResponse(res, 'Cannot toggle status for deleted dentists', 400);
    }

    // Toggle between ACTIVE and DEACTIVATED
    const newStatus = dentist.user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: newStatus }
    });

    return successResponse(res, { status: newStatus }, `Dentist ${newStatus.toLowerCase()} successfully`);
  } catch (error) {
    console.error('Error toggling dentist status:', error);
    return errorResponse(res, 'Failed to toggle dentist status');
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
router.delete('/:id', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if dentist exists
    const existingDentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(id) },
      include: { user: true }
    });

    if (!existingDentist) {
      return notFoundResponse(res, 'Dentist');
    }

    // If Clinic is making the request, verify they own this dentist
    if (req.user.role === 'Clinic' && existingDentist.clinicId !== req.user.id) {
      return errorResponse(res, 'You can only delete your own dentists', 403);
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
