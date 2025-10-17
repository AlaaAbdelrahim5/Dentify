const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get all secretaries
router.get('/', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const secretaries = await prisma.secretary.findMany({
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
    res.json({ secretaries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch secretaries' });
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
      where: { clinicId },
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
    res.json({ secretaries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch secretaries for clinic' });
  }
});

// Update secretary
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, birthDate, gender, city, clinicId } = req.body;

    // Check if secretary exists
    const existingSecretary = await prisma.secretary.findUnique({
      where: { userId: id }
    });

    if (!existingSecretary) {
      return res.status(404).json({ error: 'Secretary not found' });
    }

    // Check authorization
    if (req.user.role !== 'Admin' && req.user.role !== 'Clinic') {
      if (req.user.id !== id) {
        return res.status(403).json({ error: 'Unauthorized to update this secretary' });
      }
    }

    const secretary = await prisma.secretary.update({
      where: { userId: id },
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        city,
        clinicId
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
        },
        clinic: true
      }
    });

    res.json({ secretary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update secretary' });
  }
});

// Delete secretary
router.delete('/:id', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingSecretary = await prisma.secretary.findUnique({
      where: { userId: id }
    });

    if (!existingSecretary) {
      return res.status(404).json({ error: 'Secretary not found' });
    }

    // Delete secretary (will cascade delete user)
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Secretary deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete secretary' });
  }
});

module.exports = router;
