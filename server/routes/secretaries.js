const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Get current secretary's info (for Secretary role)
router.get('/me', authenticate, authorize('Secretary'), async (req, res) => {
  try {
    const userId = req.user.id; // The authenticated secretary's user ID
    
    const secretary = await prisma.secretary.findUnique({
      where: { userId },
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

    if (!secretary) {
      return notFoundResponse(res, 'Secretary');
    }

    // Transform data to match frontend expectations
    const transformedSecretary = {
      _id: secretary.userId,
      firstName: secretary.firstName,
      lastName: secretary.lastName,
      birthDate: secretary.birthDate,
      gender: secretary.gender,
      city: secretary.city,
      clinic: {
        id: secretary.clinic.userId,
        clinicName: secretary.clinic.clinicName,
        registrationNumber: secretary.clinic.registrationNumber,
        city: secretary.clinic.city,
        contactNumber: secretary.clinic.user.phone
      },
      userId: {
        id: secretary.user.id,
        email: secretary.user.email,
        phone: secretary.user.phone,
        status: secretary.user.status === 'ACTIVE' ? 'active' : 'inactive',
        profileImage: secretary.user.profileImage
      },
      createdAt: secretary.user.createdAt,
      updatedAt: secretary.user.updatedAt
    };

    return successResponse(res, transformedSecretary, 'Secretary profile fetched successfully');
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
        userId: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const transformedSecretaries = secretaries.map(secretary => ({
      _id: secretary.userId,
      firstName: secretary.firstName,
      lastName: secretary.lastName,
      birthDate: secretary.birthDate,
      gender: secretary.gender,
      address: {
        city: secretary.city
      },
      userId: {
        id: secretary.user.id,
        email: secretary.user.email,
        phone: secretary.user.phone,
        status: secretary.user.status === 'ACTIVE' ? 'active' : 'inactive',
        profileImage: secretary.user.profileImage
      },
      createdAt: secretary.user.createdAt,
      updatedAt: secretary.user.updatedAt
    }));

    return successResponse(res, transformedSecretaries, 'Secretaries fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch secretaries', 500);
  }
});

// Get all secretaries (Admin only)
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const secretaries = await prisma.secretary.findMany({
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
                email: true
              }
            }
          }
        }
      }
    });

    return successResponse(res, secretaries, 'Secretaries fetched successfully');
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
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true
          }
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

// Create secretary (Clinic only)
router.post('/', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const clinicId = req.user.id; // The authenticated clinic's user ID
    const { firstName, lastName, birthDate, gender, address, userId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !birthDate || !gender || !address?.city || !userId?.email || !userId?.phone || !userId?.password) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userId.email }
    });

    if (existingUser) {
      return errorResponse(res, 'A user with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userId.password, 12);

    // Create user and secretary in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: userId.email,
          password: hashedPassword,
          phone: userId.phone,
          role: 'Secretary',
          status: 'ACTIVE'
        }
      });

      // Create secretary
      const secretary = await tx.secretary.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          birthDate: new Date(birthDate),
          gender: gender.charAt(0).toUpperCase() + gender.slice(1), // Capitalize first letter
          city: address.city,
          clinicId: clinicId
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

    // Transform response to match frontend expectations
    const transformedSecretary = {
      _id: result.userId,
      firstName: result.firstName,
      lastName: result.lastName,
      birthDate: result.birthDate,
      gender: result.gender,
      address: {
        city: result.city
      },
      userId: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        status: result.user.status === 'ACTIVE' ? 'active' : 'inactive',
        profileImage: result.user.profileImage
      },
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt
    };

    return successResponse(res, transformedSecretary, 'Secretary created successfully', 201);
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

    // Transform response
    const transformedSecretary = {
      _id: result.userId,
      firstName: result.firstName,
      lastName: result.lastName,
      birthDate: result.birthDate,
      gender: result.gender,
      city: result.city,
      clinic: {
        id: result.clinic.userId,
        clinicName: result.clinic.clinicName,
        registrationNumber: result.clinic.registrationNumber,
        city: result.clinic.city,
        contactNumber: result.clinic.user.phone
      },
      userId: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        status: result.user.status === 'ACTIVE' ? 'active' : 'inactive',
        profileImage: result.user.profileImage
      },
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt
    };

    return successResponse(res, transformedSecretary, 'Secretary profile updated successfully');
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
        userUpdateData.password = await bcrypt.hash(userData.password, 12);
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

    // Transform response
    const transformedSecretary = {
      _id: result.userId,
      firstName: result.firstName,
      lastName: result.lastName,
      birthDate: result.birthDate,
      gender: result.gender,
      address: {
        city: result.city
      },
      userId: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        status: result.user.status === 'ACTIVE' ? 'active' : 'inactive',
        profileImage: result.user.profileImage
      },
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt
    };

    return successResponse(res, transformedSecretary, 'Secretary updated successfully');
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

// Toggle secretary status (activate/deactivate)
router.patch('/:id/toggle-status', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.id;

    // Find secretary and verify ownership
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
      return errorResponse(res, 'Unauthorized to modify this secretary', 403);
    }

    // Toggle status
    const currentStatus = existingSecretary.user.status;
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        status: newStatus
      },
      include: {
        secretary: true
      }
    });

    // Transform response
    const transformedSecretary = {
      _id: updatedUser.id,
      firstName: updatedUser.secretary.firstName,
      lastName: updatedUser.secretary.lastName,
      birthDate: updatedUser.secretary.birthDate,
      gender: updatedUser.secretary.gender,
      address: {
        city: updatedUser.secretary.city
      },
      userId: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.status === 'ACTIVE' ? 'active' : 'inactive',
        profileImage: updatedUser.profileImage
      },
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return successResponse(
      res, 
      transformedSecretary, 
      `Secretary ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to toggle secretary status', 500);
  }
});

module.exports = router;
