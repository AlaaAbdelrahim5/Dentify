const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');
const { hashPassword } = require('../helpers/hash');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../helpers/response');
const { createUserWithProfile, updateUserWithProfile } = require('../services/user/userService');
const { createStatsHandler, createGetProfileHandler } = require('../factories/routeHandlers');
const { getClinicIdForUser } = require('../services/appointment/appointmentService');
const { standardUserSelect, buildWhereClause } = require('../utils/queryHelpers');

// Get dentists statistics - using reusable handler
router.get('/stats', authenticate, authorize('Admin'), createStatsHandler('dentist', 'Dentist'));

// Get dentists for logged-in clinic (MUST BE BEFORE /:id route)
router.get('/clinic', authenticate, authorize('Clinic', 'Secretary'), async (req, res) => {
  try {
    const clinicUserId = await getClinicIdForUser(req.user);
    
    if (!clinicUserId) {
      return errorResponse(res, 'Secretary profile not found', 404);
    }

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
    
    // Build where clause using helper
    const searchFields = ['firstName', 'lastName', 'licenseNumber', 'user.email'];
    const customFilters = {};
    
    // Add specialization filter if provided
    if (specialization) {
      customFilters.specialization = { has: specialization };
    }
    
    // Add default active filter if includeAll is false
    if (includeAll !== 'true' && !status) {
      customFilters.user = { status: 'ACTIVE' };
    }
    
    const finalWhere = buildWhereClause({ 
      search, 
      searchFields, 
      city, 
      status, 
      customFilters 
    });

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
          select: standardUserSelect
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
        user: {
          createdAt: 'desc'
        }
      }
    });

    return paginatedResponse(res, dentists, pagination, 'Dentists fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch dentists');
  }
});

// Get dashboard statistics for dentist
router.get('/dashboard-stats', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistUserId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments (excluding pending and cancelled)
    const todayAppointments = await prisma.appointment.count({
      where: {
        dentistId: dentistUserId,
        appointmentDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          notIn: ['PENDING', 'CANCELLED']
        }
      }
    });

    // Get total unique patients
    const totalPatients = await prisma.treatment.groupBy({
      by: ['patientId'],
      where: {
        dentistId: dentistUserId
      }
    });

    // Get pending treatments
    const pendingTreatments = await prisma.treatment.count({
      where: {
        dentistId: dentistUserId,
        status: 'IN_PROGRESS'
      }
    });

    // Get completed appointments today
    const completedToday = await prisma.appointment.count({
      where: {
        dentistId: dentistUserId,
        appointmentDate: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      }
    });

    return successResponse(res, {
      stats: {
        todayAppointments,
        totalPatients: totalPatients.length,
        pendingTreatments,
        completedToday
      }
    }, 'Dashboard stats fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch dashboard stats');
  }
});

// Get current logged-in dentist profile - using reusable handler with custom include
router.get('/me', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentist = await prisma.dentist.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            ...standardUserSelect,
            role: true
          }
        },
        clinic: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!dentist) {
      return notFoundResponse(res, 'Dentist profile');
    }

    return successResponse(res, { dentist }, 'Dentist profile fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch dentist profile');
  }
});

// Update current logged-in dentist profile
router.put('/me', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistUserId = req.user.id;
    const updateData = req.body;

    // Check if dentist exists
    const existingDentist = await prisma.dentist.findUnique({
      where: { userId: dentistUserId },
      include: { user: true }
    });

    if (!existingDentist) {
      return notFoundResponse(res, 'Dentist profile');
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Separate user and dentist data
      const userUpdateData = {};
      const dentistUpdateData = {};

      // User fields
      if (updateData.email) userUpdateData.email = updateData.email;
      if (updateData.phone) userUpdateData.phone = updateData.phone;
      if (updateData.password) {
        userUpdateData.password = await hashPassword(updateData.password);
      }
      if (updateData.profileImage) userUpdateData.profileImage = updateData.profileImage;

      // Dentist fields
      if (updateData.firstName) dentistUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) dentistUpdateData.lastName = updateData.lastName;
      if (updateData.licenseNumber) dentistUpdateData.licenseNumber = updateData.licenseNumber;
      if (updateData.specialization) dentistUpdateData.specialization = updateData.specialization;
      if (updateData.birthDate) dentistUpdateData.birthDate = new Date(updateData.birthDate);
      if (updateData.gender) dentistUpdateData.gender = updateData.gender;
      if (updateData.city) dentistUpdateData.city = updateData.city;
      if (updateData.appointmentDuration !== undefined) {
        dentistUpdateData.appointmentDuration = parseInt(updateData.appointmentDuration);
      }
      if (updateData.workingHours !== undefined) {
        dentistUpdateData.workingHours = updateData.workingHours;
      }
      if (updateData.socialLinks !== undefined) {
        dentistUpdateData.socialLinks = updateData.socialLinks;
      }

      // Update user data if there's anything to update
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: dentistUserId },
          data: userUpdateData
        });
      }

      // Update dentist data if there's anything to update
      if (Object.keys(dentistUpdateData).length > 0) {
        await tx.dentist.update({
          where: { userId: dentistUserId },
          data: dentistUpdateData
        });
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
              role: true,
              status: true,
              profileImage: true,
              createdAt: true,
              updatedAt: true
            }
          },
          clinic: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      });

      return updatedDentist;
    });

    return successResponse(res, { dentist: result }, 'Dentist profile updated successfully');
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Email or license number already exists', 400);
    }
    return errorResponse(res, 'Failed to update dentist profile');
  }
});

// Create dentist - using consolidated user service
router.post('/', authenticate, authorize('Clinic', 'Admin'), async (req, res) => {
  try {
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

    // Get clinic ID
    const clinicId = req.user.role === 'Clinic' ? req.user.id : req.body.clinicId;

    if (!clinicId) {
      return errorResponse(res, 'Clinic ID is required', 400);
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !licenseNumber || !birthDate || !city) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Prepare user and profile data
    const userData = { email, password, phone, role: 'Dentist', status: 'PENDING' };
    const profileData = {
      firstName,
      lastName,
      licenseNumber,
      specialization: specialization || [],
      birthDate,
      gender,
      city,
      clinicId,
      appointmentDuration,
      workingHours,
      socialLinks
    };

    // Create using service
    const result = await createUserWithProfile(userData, profileData, 'dentist');

    return successResponse(res, result, 'Dentist created successfully', 201);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return errorResponse(res, error.message, 400);
    }
    if (error.code === 'P2002') {
      return errorResponse(res, 'Email or license number already exists', 400);
    }
    return errorResponse(res, 'Failed to create dentist');
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
          userUpdateData.password = await hashPassword(userData.password);
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

    // Update user status to REJECTED
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });

    // TODO: Send rejection email with reason
    
    return successResponse(res, { reason }, 'Dentist rejected successfully');
  } catch (error) {
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
    return errorResponse(res, 'Failed to delete dentist');
  }
});

module.exports = router;
