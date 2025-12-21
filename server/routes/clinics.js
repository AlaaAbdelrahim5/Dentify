const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const { paginatedResponse, successResponse, errorResponse, notFoundResponse, calculatePagination } = require('../utils/responseHelper');

// Get current clinic profile
router.get('/me', authenticate, authorize('Clinic'), async (req, res) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { userId: req.user.id },
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

    if (!clinic) {
      return notFoundResponse(res, 'Clinic not found');
    }

    res.json({ 
      success: true,
      data: clinic
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch clinic profile');
  }
});

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

// Get clinics statistics
router.get('/stats', authenticate, authorize('Admin'), async (req, res) => {
  try {
    // Count all users with Clinic role (excluding DELETED completely from total)
    const total = await prisma.user.count({
      where: {
        role: 'Clinic'
      }
    });
    
    const active = await prisma.user.count({
      where: {
        role: 'Clinic',
        status: 'ACTIVE'
      }
    });
    
    // Count inactive clinics (PENDING, DEACTIVATED, or DELETED)
    const inactive = await prisma.user.count({
      where: {
        role: 'Clinic',
        status: {
          in: ['PENDING', 'DEACTIVATED', 'DELETED']
        }
      }
    });
    
    res.json({ 
      success: true,
      data: {
        total,
        active,
        pending: inactive  // Frontend expects 'pending' key for inactive clinics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch clinic statistics' });
  }
});

// Get all clinics with pagination and filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', city = '', isActive = '' } = req.query;
    
    // Build where clause
    const whereClause = {
      AND: []
    };

    // Search filter
    if (search) {
      whereClause.AND.push({
        OR: [
          { clinicName: { contains: search } },
          { registrationNumber: { contains: search } },
          { city: { contains: search } },
          { user: { email: { contains: search } } }
        ]
      });
    }

    // City filter
    if (city) {
      // Use case-insensitive ILIKE for PostgreSQL
      whereClause.AND.push({ 
        city: {
          contains: city
        }
      });
    }

    // Status filter
    if (isActive) {
      if (isActive === 'true') {
        whereClause.AND.push({ user: { status: 'ACTIVE' } });
      } else if (isActive === 'false') {
        // Include all inactive statuses
        whereClause.AND.push({ 
          user: { 
            status: {
              in: ['PENDING', 'DEACTIVATED', 'DELETED']
            }
          } 
        });
      }
    }

    // If no filters, remove AND array
    const finalWhere = whereClause.AND.length > 0 ? whereClause : {};

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

// Create new clinic
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and clinic in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone: phone || null,
          role: 'Clinic',
          status: 'ACTIVE'
        }
      });

      const clinic = await tx.clinic.create({
        data: {
          userId: user.id,
          clinicName,
          registrationNumber,
          city,
          location: location || null,
          coordinates: coordinates || null,
          website: website || null,
          description: description || null,
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

      return clinic;
    });

    return successResponse(res, result, 'Clinic created successfully', 201);
  } catch (error) {

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

// Toggle clinic status (activate/deactivate)
router.patch('/:id/toggle-status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if clinic exists
    const existingClinic = await prisma.clinic.findUnique({
      where: { userId: parseInt(id) },
      include: {
        user: {
          select: {
            status: true
          }
        }
      }
    });

    if (!existingClinic) {
      return notFoundResponse(res, 'Clinic');
    }

    // Toggle status: ACTIVE <-> DEACTIVATED
    const currentStatus = existingClinic.user.status;
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    // Update status
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: newStatus }
    });

    const message = newStatus === 'ACTIVE' ? 'Clinic activated successfully' : 'Clinic deactivated successfully';
    return successResponse(res, { status: newStatus }, message);
  } catch (error) {
    return errorResponse(res, 'Failed to toggle clinic status');
  }
});

// Delete clinic (soft delete)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if clinic exists
    const existingClinic = await prisma.clinic.findUnique({
      where: { userId: parseInt(id) }
    });

    if (!existingClinic) {
      return notFoundResponse(res, 'Clinic');
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'DELETED' }
    });

    return successResponse(res, null, 'Clinic deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete clinic');
  }
});

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
