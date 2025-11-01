const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get treatments statistics for dentist
router.get('/stats', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;

    const total = await prisma.treatment.count({
      where: { dentistId }
    });

    const active = await prisma.treatment.count({
      where: { 
        dentistId,
        status: 'IN_PROGRESS'
      }
    });

    const completed = await prisma.treatment.count({
      where: { 
        dentistId,
        status: 'COMPLETED'
      }
    });

    const totalRevenue = await prisma.treatment.aggregate({
      where: { dentistId },
      _sum: {
        paidAmount: true
      }
    });

    const pendingPayments = await prisma.treatment.aggregate({
      where: { dentistId },
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    });

    const pending = (pendingPayments._sum.totalAmount || 0) - (pendingPayments._sum.paidAmount || 0);

    res.json({ 
      data: {
        total,
        active,
        completed,
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        pendingPayments: pending
      }
    });
  } catch (error) {
    console.error('Error fetching treatment stats:', error);
    res.status(500).json({ error: 'Failed to fetch treatment statistics' });
  }
});

// Get all treatments for dentist
router.get('/dentist/my-treatments', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { status } = req.query;

    const where = { dentistId };
    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_');
    }

    const treatments = await prisma.treatment.findMany({
      where,
      include: {
        patient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        }
        // Removed nested appointments and payments - they are rarely needed in list view
        // and can be fetched separately when viewing treatment details
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ treatments });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// Get all treatments (for admins and clinics)
router.get('/', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const treatments = await prisma.treatment.findMany({
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        },
        dentist: {
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
        createdAt: 'desc'
      }
    });
    res.json({ treatments });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// Get treatment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        },
        dentist: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        },
        appointments: true,
        payments: true,
        radiologyReqs: true
      }
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    res.json({ treatment });
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({ error: 'Failed to fetch treatment' });
  }
});

// Create new treatment
router.post('/', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { 
      patientId, 
      treatmentType, 
      description, 
      totalAmount, 
      notes,
      teethStatus 
    } = req.body;

    // Validate required fields
    if (!patientId || !treatmentType) {
      return res.status(400).json({ error: 'Patient ID and treatment type are required' });
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { userId: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const treatment = await prisma.treatment.create({
      data: {
        patientId: parseInt(patientId),
        dentistId,
        treatmentType,
        description,
        totalAmount: parseFloat(totalAmount) || 0,
        notes,
        teethStatus: teethStatus || [],
        status: 'IN_PROGRESS'
      },
      include: {
        patient: {
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

    res.status(201).json({ 
      message: 'Treatment created successfully', 
      treatment 
    });
  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({ error: 'Failed to create treatment' });
  }
});

// Update treatment
router.put('/:id', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const { id } = req.params;
    const dentistId = req.user.id;
    const { 
      treatmentType, 
      description, 
      status,
      totalAmount, 
      paidAmount,
      notes,
      teethStatus 
    } = req.body;

    // Check if treatment exists and belongs to dentist
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTreatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    if (existingTreatment.dentistId !== dentistId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (treatmentType) updateData.treatmentType = treatmentType;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (notes !== undefined) updateData.notes = notes;
    if (teethStatus !== undefined) updateData.teethStatus = teethStatus;

    const treatment = await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        patient: {
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

    res.json({ 
      message: 'Treatment updated successfully', 
      treatment 
    });
  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({ error: 'Failed to update treatment' });
  }
});

// Delete treatment
router.delete('/:id', authenticate, authorize('Dentist', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if treatment exists
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    // Only allow dentist who created it or admin to delete
    if (userRole !== 'Admin' && treatment.dentistId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.treatment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({ error: 'Failed to delete treatment' });
  }
});

module.exports = router;
