const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get all clinics
router.get('/', authenticate, async (req, res) => {
  try {
    const clinics = await prisma.clinic.findMany({
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
    res.json({ clinics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinics' });
  }
});

// Get clinic by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.findUnique({
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
        secretaries: true
      }
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json({ clinic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});

// Update clinic
router.put('/:id', authenticate, authorize('Clinic', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, description, socialLinks } = req.body;

    const clinic = await prisma.clinic.update({
      where: { userId: id },
      data: { name, address, city, description, socialLinks }
    });

    res.json({ message: 'Clinic updated successfully', clinic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update clinic' });
  }
});

module.exports = router;
