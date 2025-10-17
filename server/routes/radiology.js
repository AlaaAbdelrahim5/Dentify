const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get all radiology centers
router.get('/', authenticate, async (req, res) => {
  try {
    const radiologyCenters = await prisma.radiologyCenter.findMany({
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
    res.status(500).json({ error: 'Failed to fetch radiology centers' });
  }
});

// Get radiology center by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const radiologyCenter = await prisma.radiologyCenter.findUnique({
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
        }
      }
    });

    if (!radiologyCenter) {
      return res.status(404).json({ error: 'Radiology center not found' });
    }

    res.json({ radiologyCenter });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch radiology center' });
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
