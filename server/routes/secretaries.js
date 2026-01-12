const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../helpers/response');
const { createUserWithProfile, updateUserWithProfile } = require('../services/user/userService');
const { hashPassword } = require('../helpers/hash');
const { transformSecretary } = require('../utils/responseTransformers');
const { standardUserSelect, buildWhereClause } = require('../utils/queryHelpers');
const { createStatsHandler } = require('../factories/routeHandlers');
const { sendNotification } = require('../services/notification/notificationService');

// Get secretaries statistics - using reusable handler
router.get('/stats', authenticate, authorize('Admin'), createStatsHandler('secretary', 'Secretary'));

// Get current secretary's info (for Secretary role)
router.get('/me', authenticate, authorize('Secretary'), async (req, res) => {
  try {
    const userId = req.user.id; // The authenticated secretary's user ID
    
    const secretary = await prisma.secretary.findUnique({
      where: { userId },
      include: {
        user: {
          select: standardUserSelect
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

    if (!secretary) {
      return notFoundResponse(res, 'Secretary');
    }

    return successResponse(res, transformSecretary(secretary), 'Secretary profile fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch secretary profile', 500);
  }
});

// Get secretaries for the authenticated clinic
router.get('/clinic', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const clinicId = req.user.id; // The authenticated clinic's user ID
    
    const secretaries = await prisma.secretary.findMany({
      where: { clinicId },
      include: {
        user: {
          select: standardUserSelect
        }
      },
      orderBy: {
        userId: 'desc'
      }
    });

    const transformedSecretaries = secretaries.map(transformSecretary);

    return successResponse(res, transformedSecretaries, 'Secretaries fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch secretaries', 500);
  }
});

// Get all secretaries (Admin only)
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search = '', 
      city = '', 
      status = '',
      gender = '',
      includeAll = 'false'
    } = req.query;
    
    // Build where clause
    const searchFields = ['firstName', 'lastName', 'user.email'];
    const customFilters = {};
    
    // Add gender filter if provided
    if (gender) {
      customFilters.gender = gender;
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
    const total = await prisma.secretary.count({ where: finalWhere });
    
    // Calculate pagination
    const pagination = calculatePagination(page, limit, total);

    // Fetch secretaries
    const secretaries = await prisma.secretary.findMany({
      where: finalWhere,
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        user: {
          select: standardUserSelect
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
      },
      orderBy: {
        userId: 'desc'
      }
    });

    const transformedSecretaries = secretaries.map(transformSecretary);

    return paginatedResponse(res, transformedSecretaries, pagination, 'Secretaries fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch secretaries', 500);
  }
});

// Get secretary by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const secretary = await prisma.secretary.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: standardUserSelect
        },
        clinic: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!secretary) {
      return res.status(404).json({ error: 'Secretary not found' });
    }

    res.json({ secretary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch secretary' });
  }
});

// Get secretaries by clinic ID
router.get('/clinic/:clinicId', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const { clinicId } = req.params;
    const secretaries = await prisma.secretary.findMany({
      where: { clinicId: parseInt(clinicId) },
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
    return successResponse(res, secretaries, 'Secretaries fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch secretaries for clinic', 500);
  }
});

// Create secretary - using consolidated user service
router.post('/', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const clinicId = req.user.id;
    const { firstName, lastName, birthDate, gender, address, userId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !birthDate || !gender || !address?.city || !userId?.email || !userId?.phone || !userId?.password) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Prepare user and profile data
    const userData = {
      email: userId.email,
      password: userId.password,
      phone: userId.phone,
      role: 'Secretary',
      status: 'PENDING'
    };

    const profileData = {
      firstName,
      lastName,
      birthDate,
      gender,
      city: address.city,
      clinicId
    };

    // Create using service
    const result = await createUserWithProfile(userData, profileData, 'secretary');

    // Send notification to all admins about the new secretary request
    try {
      // Get clinic info for notification
      const clinic = await prisma.clinic.findUnique({
        where: { userId: clinicId },
        select: { clinicName: true }
      });

      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { role: 'Admin' },
        select: { id: true }
      });

      // Send notification to each admin
      const notificationPromises = admins.map(admin => 
        sendNotification(
          admin.id,
          'New Secretary Request',
          `${clinic?.clinicName || 'A clinic'} has requested to add ${firstName} ${lastName} as a secretary.`,
          {
            type: 'secretary_request',
            data: {
              secretaryId: result.userId,
              clinicId,
              clinicName: clinic?.clinicName,
              secretaryName: `${firstName} ${lastName}`
            }
          }
        )
      );

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Failed to send admin notifications:', notifError);
      // Don't fail the request if notification fails
    }

    return successResponse(res, transformSecretary(result), 'Secretary created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to create secretary', 500);
  }
});

// Update current secretary profile (for Secretary role)
router.put('/me', authenticate, authorize('Secretary'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, birthDate, gender, city, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !birthDate || !gender || !city) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user data if phone is provided
      if (phone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone }
        });
      }

      // Update secretary data
      const secretary = await tx.secretary.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          birthDate: new Date(birthDate),
          gender: gender.charAt(0).toUpperCase() + gender.slice(1),
          city
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

      return secretary;
    });

    return successResponse(res, transformSecretary(result), 'Secretary profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update secretary profile', 500);
  }
});

// Update secretary
router.put('/:id', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.id;
    const { userData, secretaryData } = req.body;

    // Validate required fields
    if (!secretaryData?.firstName || !secretaryData?.lastName || !secretaryData?.birthDate || !secretaryData?.gender || !secretaryData?.address?.city) {
      return errorResponse(res, 'All required secretary fields must be provided', 400);
    }

    if (!userData?.email || !userData?.phone) {
      return errorResponse(res, 'Email and phone are required', 400);
    }

    // Check if secretary exists and belongs to this clinic
    const existingSecretary = await prisma.secretary.findUnique({
      where: { userId: parseInt(id) },
      include: {
        user: true
      }
    });

    if (!existingSecretary) {
      return notFoundResponse(res, 'Secretary');
    }

    // Check if secretary belongs to this clinic
    if (existingSecretary.clinicId !== clinicId) {
      return errorResponse(res, 'Unauthorized to update this secretary', 403);
    }

    // Check if email is being changed and if new email already exists
    if (userData.email !== existingSecretary.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (emailExists) {
        return errorResponse(res, 'A user with this email already exists', 400);
      }
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user data
      const userUpdateData = {
        email: userData.email,
        phone: userData.phone
      };

      // Only update password if provided
      if (userData.password) {
        userUpdateData.password = await hashPassword(userData.password);
      }

      await tx.user.update({
        where: { id: parseInt(id) },
        data: userUpdateData
      });

      // Update secretary data
      const secretary = await tx.secretary.update({
        where: { userId: parseInt(id) },
        data: {
          firstName: secretaryData.firstName,
          lastName: secretaryData.lastName,
          birthDate: new Date(secretaryData.birthDate),
          gender: secretaryData.gender.charAt(0).toUpperCase() + secretaryData.gender.slice(1),
          city: secretaryData.address.city
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
          }
        }
      });

      return secretary;
    });

    return successResponse(res, transformSecretary(result), 'Secretary updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update secretary', 500);
  }
});

// Delete secretary
router.delete('/:id', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.id;

    const existingSecretary = await prisma.secretary.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingSecretary) {
      return notFoundResponse(res, 'Secretary');
    }

    // Check if secretary belongs to this clinic
    if (existingSecretary.clinicId !== clinicId) {
      return errorResponse(res, 'Unauthorized to delete this secretary', 403);
    }

    // Delete user (will cascade delete secretary)
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, null, 'Secretary deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to delete secretary', 500);
  }
});

// Approve secretary (Admin only)
router.post('/:id/approve', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if secretary exists
    const secretary = await prisma.secretary.findUnique({
      where: { userId: parseInt(id) },
      include: { 
        user: true,
        clinic: {
          select: {
            userId: true,
            clinicName: true
          }
        }
      }
    });

    if (!secretary) {
      return notFoundResponse(res, 'Secretary');
    }

    // Update user status to ACTIVE
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'ACTIVE' }
    });

    // Send notification to clinic
    try {
      await sendNotification(
        secretary.clinicId,
        'Secretary Request Approved',
        `Your request to add ${secretary.firstName} ${secretary.lastName} as a secretary has been approved by the admin. The secretary account is now active.`,
        {
          type: 'secretary_approved',
          data: {
            secretaryId: secretary.userId,
            secretaryName: `${secretary.firstName} ${secretary.lastName}`
          }
        }
      );
    } catch (notifError) {
      console.error('Failed to send clinic notification:', notifError);
    }

    return successResponse(res, null, 'Secretary approved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to approve secretary');
  }
});

// Toggle secretary status (Admin and Clinic can toggle between ACTIVE and DEACTIVATED)
router.patch('/:id/toggle-status', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if secretary exists
    const secretary = await prisma.secretary.findUnique({
      where: { userId: parseInt(id) },
      include: { user: true }
    });

    if (!secretary) {
      return notFoundResponse(res, 'Secretary');
    }

    // If Clinic is making the request, verify they own this secretary
    if (req.user.role === 'Clinic' && secretary.clinicId !== req.user.id) {
      return errorResponse(res, 'You can only toggle status for your own secretaries', 403);
    }

    // Can only toggle if status is ACTIVE or DEACTIVATED (not PENDING or DELETED)
    if (secretary.user.status === 'PENDING') {
      return errorResponse(res, 'Cannot toggle status for pending secretaries. Please approve first.', 400);
    }

    if (secretary.user.status === 'DELETED') {
      return errorResponse(res, 'Cannot toggle status for deleted secretaries', 400);
    }

    // Toggle between ACTIVE and DEACTIVATED
    const newStatus = secretary.user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: newStatus }
    });

    return successResponse(res, { status: newStatus }, `Secretary ${newStatus.toLowerCase()} successfully`);
  } catch (error) {
    return errorResponse(res, 'Failed to toggle secretary status');
  }
});

// Reject secretary (Admin only)
router.post('/:id/reject', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if secretary exists
    const secretary = await prisma.secretary.findUnique({
      where: { userId: parseInt(id) },
      include: { 
        user: true,
        clinic: {
          select: {
            userId: true,
            clinicName: true
          }
        }
      }
    });

    if (!secretary) {
      return notFoundResponse(res, 'Secretary');
    }

    // Update user status to REJECTED
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });

    // Send notification to clinic
    try {
      await sendNotification(
        secretary.clinicId,
        'Secretary Request Rejected',
        `Your request to add ${secretary.firstName} ${secretary.lastName} as a secretary has been rejected by the admin.${reason ? ` Reason: ${reason}` : ''}`,
        {
          type: 'secretary_rejected',
          data: {
            secretaryId: secretary.userId,
            secretaryName: `${secretary.firstName} ${secretary.lastName}`,
            reason: reason || ''
          }
        }
      );
    } catch (notifError) {
      console.error('Failed to send clinic notification:', notifError);
    }
    
    return successResponse(res, { reason }, 'Secretary rejected successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to reject secretary');
  }
});

module.exports = router;
