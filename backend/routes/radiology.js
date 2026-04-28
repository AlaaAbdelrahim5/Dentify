const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../helpers/response');
const { createUserWithProfile, updateUserWithProfile } = require('../services/user/userService');
const { createStatsHandler, createGetProfileHandler } = require('../factories/routeHandlers');
const { standardUserSelect, buildPagination, buildWhereClause } = require('../utils/queryHelpers');
const { hashPassword } = require('../helpers/hash');

// Helper function to check if user exists
const checkUserExists = async (email) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  return !!existingUser;
};

// Get radiology centers statistics - using reusable handler
router.get('/stats', authenticate, authorize('Admin'), createStatsHandler('radiologyCenter', 'RadiologyCenter', true));

// Get current radiology center profile - using reusable handler
router.get('/me', authenticate, authorize('RadiologyCenter'), createGetProfileHandler('radiologyCenter'));

// Update current radiology center profile
router.put('/me', authenticate, authorize('RadiologyCenter'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      centerName,
      website,
      city,
      location,
      coordinates,
      description,
      workingHours,
      supportedTypes
    } = req.body;

    // Update radiology center (registrationNumber is read-only)
    const updatedCenter = await prisma.radiologyCenter.update({
      where: { userId },
      data: {
        ...(centerName && { centerName }),
        ...(website !== undefined && { website }),
        ...(city && { city }),
        ...(location !== undefined && { location }),
        ...(coordinates !== undefined && { coordinates }),
        ...(description !== undefined && { description }),
        ...(workingHours !== undefined && { workingHours }),
        ...(supportedTypes !== undefined && { supportedTypes })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true
          }
        }
      }
    });

    res.json({ 
      success: true,
      data: updatedCenter,
      message: 'Radiology center profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update radiology center profile' 
    });
  }
});

// Get all radiology centers with pagination and filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', city = '', isActive = '' } = req.query;
    
    // Build where clause using helper
    const searchFields = ['centerName', 'registrationNumber', 'city', 'location', 'user.email'];
    const finalWhere = buildWhereClause({ search, searchFields, city, isActive });

    // Get total count
    const total = await prisma.radiologyCenter.count({ where: finalWhere });
    
    // Calculate pagination
    const pagination = calculatePagination(page, limit, total);

    // Fetch radiology centers
    const radiologyCenters = await prisma.radiologyCenter.findMany({
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
        }
      },
      orderBy: {
        userId: 'desc'
      }
    });

    return paginatedResponse(res, radiologyCenters, pagination, 'Radiology centers fetched successfully');
  } catch (error) {
    return errorResponse(res, `Failed to fetch radiology centers: ${error.message}`, 500);
  }
});

// Toggle radiology center status (activate/deactivate) - MUST BE BEFORE /:id route
router.patch('/:id/toggle-status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if radiology center exists
    const existingCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: parseInt(id) },
      include: {
        user: {
          select: {
            status: true
          }
        }
      }
    });

    if (!existingCenter) {
      return notFoundResponse(res, 'Radiology center');
    }

    // Toggle status
    const newStatus = existingCenter.user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: newStatus }
    });

    const message = newStatus === 'ACTIVE' ? 'Radiology center activated successfully' : 'Radiology center deactivated successfully';
    return successResponse(res, { status: newStatus }, message);
  } catch (error) {
    return errorResponse(res, 'Failed to toggle radiology center status');
  }
});

// Get radiology center by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const radiologyCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: parseInt(id) },
      include: {
        user: {
          select: standardUserSelect
        }
      }
    });

    if (!radiologyCenter) {
      return notFoundResponse(res, 'Radiology center');
    }

    return successResponse(res, radiologyCenter, 'Radiology center fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch radiology center');
  }
});

// Create new radiology center
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { 
      email, 
      password, 
      phone,
      centerName,
      registrationNumber, 
      city, 
      location, 
      coordinates, 
      website, 
      description, 
      supportedTypes, 
      workingHours 
    } = req.body;

    // Validate required fields
    if (!email || !password || !centerName || !registrationNumber || !city) {
      return errorResponse(res, 'Email, password, center name, registration number, and city are required', 400);
    }

    // Check if user already exists
    if (await checkUserExists(email)) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and radiology center in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone: phone || null,
          role: 'RadiologyCenter',
          status: 'ACTIVE'
        }
      });

      const radiologyCenter = await tx.radiologyCenter.create({
        data: {
          userId: user.id,
          centerName,
          registrationNumber,
          city,
          location: location || null,
          coordinates: coordinates || null,
          website: website || null,
          description: description || null,
          supportedTypes: supportedTypes || [],
          workingHours: workingHours || null
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

      return radiologyCenter;
    });

    return successResponse(res, result, 'Radiology center created successfully', 201);
  } catch (error) {
    return errorResponse(res, `Failed to create radiology center: ${error.message}`, 500);
  }
});

// Update radiology center - using consolidated user service  
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      email,
      phone,
      centerName,
      registrationNumber,
      city,
      location,
      coordinates,
      website,
      description,
      supportedTypes,
      workingHours
    } = req.body;

    // Check if radiology center exists
    const existingCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingCenter) {
      return notFoundResponse(res, 'Radiology center');
    }

    // Prepare update data
    const userData = {};
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const profileData = {};
    if (centerName) profileData.centerName = centerName;
    if (registrationNumber) profileData.registrationNumber = registrationNumber;
    if (city) profileData.city = city;
    if (location !== undefined) profileData.location = location;
    if (coordinates !== undefined) profileData.coordinates = coordinates;
    if (website !== undefined) profileData.website = website;
    if (description !== undefined) profileData.description = description;
    if (supportedTypes) profileData.supportedTypes = supportedTypes;
    if (workingHours !== undefined) profileData.workingHours = workingHours;

    // Update using service
    const result = await updateUserWithProfile(parseInt(id), userData, profileData, 'radiologyCenter');

    return successResponse(res, result, 'Radiology center updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update radiology center');
  }
});

// Delete radiology center (soft delete by updating status)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if radiology center exists
    const existingCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingCenter) {
      return notFoundResponse(res, 'Radiology center');
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'DELETED' }
    });

    return successResponse(res, null, 'Radiology center deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete radiology center');
  }
});

// Get radiology centers by city
router.get('/city/:city', authenticate, async (req, res) => {
  try {
    const { city } = req.params;
    const radiologyCenters = await prisma.radiologyCenter.findMany({
      where: { 
        city: {
          contains: city,
          mode: 'insensitive'
        },
        user: {
          status: 'ACTIVE'
        }
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
    res.json({ radiologyCenters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch radiology centers by city' });
  }
});

// Get radiology centers by supported type
router.get('/type/:type', authenticate, async (req, res) => {
  try {
    const { type } = req.params;
    const radiologyCenters = await prisma.radiologyCenter.findMany({
      where: { 
        supportedTypes: {
          has: type
        },
        user: {
          status: 'ACTIVE'
        }
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
    res.json({ radiologyCenters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch radiology centers by type' });
  }
});

// Update radiology center
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      registrationNumber, 
      website, 
      city, 
      location, 
      coordinates, 
      description, 
      workingHours, 
      supportedTypes 
    } = req.body;

    // Check if radiology center exists
    const existingCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: id }
    });

    if (!existingCenter) {
      return res.status(404).json({ error: 'Radiology center not found' });
    }

    // Check authorization
    if (req.user.role !== 'Admin') {
      if (req.user.id !== id) {
        return res.status(403).json({ error: 'Unauthorized to update this radiology center' });
      }
    }

    const radiologyCenter = await prisma.radiologyCenter.update({
      where: { userId: id },
      data: {
        registrationNumber,
        website,
        city,
        location,
        coordinates,
        description,
        workingHours,
        supportedTypes
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

    res.json({ radiologyCenter });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update radiology center' });
  }
});

// Update radiology center status (Admin only)
router.patch('/:id/status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'PENDING', 'DEACTIVATED', 'DELETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const radiologyCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: id }
    });

    if (!radiologyCenter) {
      return res.status(404).json({ error: 'Radiology center not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Radiology center status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update radiology center status' });
  }
});

// Delete radiology center (Admin only)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: id }
    });

    if (!existingCenter) {
      return res.status(404).json({ error: 'Radiology center not found' });
    }

    // Delete radiology center (will cascade delete user)
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Radiology center deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete radiology center' });
  }
});

module.exports = router;
