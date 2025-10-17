const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get current patient's profile (for logged-in patient)
router.get('/me', authenticate, authorize('Patient'), async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
});

// Get all patients
router.get('/', authenticate, authorize('Dentist', 'Clinic', 'Admin'), async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
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
    res.json({ patients });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
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

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Update patient
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, city, birthDate } = req.body;

    // Check if user can update (must be own profile or dentist/clinic/admin)
    const allowedRoles = ['Patient', 'Dentist', 'Clinic', 'Admin'];
    if (req.user.id !== id && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await prisma.patient.update({
      where: { userId: id },
      data: { firstName, lastName, city, birthDate: new Date(birthDate) }
    });

    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

module.exports = router;
