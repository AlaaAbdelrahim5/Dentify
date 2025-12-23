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
const { standardUserSelect, buildWhereClause } = require('../utils/queryHelpers');

// Get current clinic profile - using reusable handler
router.get('/me', authenticate, authorize('Clinic'), createGetProfileHandler('clinic'));

// Update current clinic profile
router.put('/me', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const { clinicName, registrationNumber, city, location, website, description, workingHours, availableTreatments } = req.body;

    const updateData = {};
    if (clinicName !== undefined) updateData.clinicName = clinicName;
    if (city !== undefined) updateData.city = city;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (availableTreatments !== undefined) updateData.availableTreatments = availableTreatments;

    const clinic = await prisma.clinic.update({
      where: { userId: req.user.id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            status: true
          }
        }
      }
    });

    res.json({ 
      success: true,
      message: 'Clinic profile updated successfully',
      data: clinic
    });
  } catch (error) {
    errorResponse(res, 'Failed to update clinic profile');
  }
});

// Get clinics statistics - using reusable handler
router.get('/stats', authenticate, authorize('Admin'), createStatsHandler('clinic', 'Clinic', true));

// Get all clinics with pagination and filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', city = '', isActive = '' } = req.query;
    
    // Build where clause using helper
    const searchFields = ['clinicName', 'registrationNumber', 'city', 'user.email'];
    const finalWhere = buildWhereClause({ search, searchFields, city, isActive });

    // Get total count
    const total = await prisma.clinic.count({ where: finalWhere });
    
    // Calculate pagination
    const pagination = calculatePagination(page, limit, total);

    // Fetch clinics
    const clinics = await prisma.clinic.findMany({
      where: finalWhere,
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        user: {
          select: standardUserSelect
        },
        dentists: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            specialization: true,
            user: {
              select: {
                status: true
              }
            }
          }
        },
        secretaries: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        userId: 'desc'
      }
    });

    return paginatedResponse(res, clinics, pagination, 'Clinics fetched successfully');
  } catch (error) {
    return errorResponse(res, `Failed to fetch clinics: ${error.message}`, 500);
  }
});

// Get clinic by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.findUnique({
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
        },
        dentists: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true
              }
            }
          }
        },
        secretaries: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!clinic) {
      return notFoundResponse(res, 'Clinic');
    }

    return successResponse(res, clinic, 'Clinic fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch clinic');
  }
});

// Create new clinic - using consolidated user service
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { 
      email, 
      password, 
      phone, 
      clinicName, 
      registrationNumber, 
      city, 
      location, 
      coordinates, 
      website, 
      description, 
      workingHours 
    } = req.body;

    // Validate required fields
    if (!email || !password || !clinicName || !registrationNumber || !city) {
      return errorResponse(res, 'Email, password, clinic name, registration number, and city are required', 400);
    }

    // Prepare user and profile data
    const userData = { email, password, phone, role: 'Clinic', status: 'ACTIVE' };
    const profileData = {
      clinicName,
      registrationNumber,
      city,
      location: location || null,
      coordinates: coordinates || null,
      website: website || null,
      description: description || null,
      workingHours: workingHours || null
    };

    // Create using service
    const result = await createUserWithProfile(userData, profileData, 'clinic');

    return successResponse(res, result, 'Clinic created successfully', 201);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, `Failed to create clinic: ${error.message}`, 500);
  }
});

// Update clinic
router.put('/:id', authenticate, authorize('Clinic', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { clinicName, registrationNumber, city, location, coordinates, website, description, workingHours } = req.body;

    const clinic = await prisma.clinic.update({
      where: { userId: parseInt(id) },
      data: {
        ...(clinicName && { clinicName }),
        ...(registrationNumber && { registrationNumber }),
        ...(city && { city }),
        ...(location !== undefined && { location }),
        ...(coordinates !== undefined && { coordinates }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(workingHours && { workingHours })
      },
      include: {
        user: true
      }
    });

    return successResponse(res, clinic, 'Clinic updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update clinic');
  }
});

// Toggle clinic status - using reusable handler
router.patch('/:id/toggle-status', authenticate, authorize('Admin'), createToggleStatusHandler('clinic', 'Clinic'));

// Delete clinic - using reusable handler
router.delete('/:id', authenticate, authorize('Admin'), createDeleteHandler('clinic', 'Clinic'));

// Get available treatments for a clinic
router.get('/:id/available-treatments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await prisma.clinic.findUnique({
      where: { userId: parseInt(id) },
      select: {
        availableTreatments: true
      }
    });

    if (!clinic) {
      return notFoundResponse(res, 'Clinic not found');
    }

    res.json({
      success: true,
      data: clinic.availableTreatments || []
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch available treatments');
  }
});

// Update available treatments for current clinic
router.put('/me/available-treatments', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const { availableTreatments } = req.body;

    // Validate structure: [{ name: "Root Canal", cost: 150 }, ...]
    if (!Array.isArray(availableTreatments)) {
      return res.status(400).json({ error: 'availableTreatments must be an array' });
    }

    for (const treatment of availableTreatments) {
      if (!treatment.name || typeof treatment.name !== 'string') {
        return res.status(400).json({ error: 'Each treatment must have a name (string)' });
      }
      if (treatment.cost === undefined) {
        treatment.cost = 0; // Default to 0
      }
      if (typeof treatment.cost !== 'number' || treatment.cost < 0) {
        return res.status(400).json({ error: 'Treatment cost must be a non-negative number' });
      }
    }

    const clinic = await prisma.clinic.update({
      where: { userId: req.user.id },
      data: { availableTreatments },
      include: {
        user: {
          select: {
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Available treatments updated successfully',
      data: clinic
    });
  } catch (error) {
    errorResponse(res, 'Failed to update available treatments');
  }
});

module.exports = router;
