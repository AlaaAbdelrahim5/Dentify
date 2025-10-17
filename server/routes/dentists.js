const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get all dentists
router.get('/', authenticate, async (req, res) => {
  try {
    const dentists = await prisma.dentist.findMany({
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
    res.json({ dentists });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dentists' });
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
    const { 
      firstName, 
      lastName, 
      specialization, 
      workingHours, 
      appointmentDuration,
      socialLinks 
    } = req.body;

    const dentist = await prisma.dentist.update({
      where: { userId: id },
      data: { 
        firstName, 
        lastName, 
        specialization, 
        workingHours, 
        appointmentDuration,
        socialLinks
      }
    });

    res.json({ message: 'Dentist updated successfully', dentist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dentist' });
  }
});

module.exports = router;
