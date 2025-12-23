const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');
const { sendTreatmentNotification } = require('../services/notification/notificationService');
const { validateEntityExists } = require('../helpers/validation');

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
            lastName: true,
            birthDate: true,
            gender: true,
            city: true,
            user: {
              select: {
                email: true,
                phone: true,
                status: true
              }
            }
          }
        },
        dentist: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            specialization: true,
            clinic: {
              select: {
                userId: true,
                clinicName: true,
                city: true,
                location: true
              }
            }
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
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// Get all treatments for logged-in patient
router.get('/patient/my-treatments', authenticate, authorize('Patient'), async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    const where = { patientId };
    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_');
    }

    const treatments = await prisma.treatment.findMany({
      where,
      include: {
        dentist: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ treatments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// Get all treatments for clinic (Clinic and Secretary access)
router.get('/clinic/my-treatments', authenticate, authorize('Clinic', 'Secretary'), async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let clinicId;

    // Get clinic ID based on user role
    if (userRole === 'Clinic') {
      // For clinic users, the userId is directly the clinicId
      const clinic = await prisma.clinic.findUnique({
        where: { userId },
        select: { userId: true }
      });

      if (!clinic) {
        return res.status(404).json({ error: 'Clinic profile not found' });
      }

      clinicId = clinic.userId;
    } else if (userRole === 'Secretary') {
      // Get secretary's clinic
      const secretary = await prisma.secretary.findUnique({
        where: { userId },
        select: { clinicId: true }
      });

      if (!secretary) {
        return res.status(404).json({ error: 'Secretary profile not found' });
      }

      clinicId = secretary.clinicId;
    }

    // Get all dentists in the clinic
    const dentistsInClinic = await prisma.dentist.findMany({
      where: { clinicId },
      select: { userId: true }
    });

    const dentistIds = dentistsInClinic.map(d => d.userId);

    const where = { dentistId: { in: dentistIds } };
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
            lastName: true,
            birthDate: true,
            gender: true,
            city: true,
            user: {
              select: {
                email: true,
                phone: true,
                status: true
              }
            }
          }
        },
        dentist: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            specialization: true,
            clinic: {
              select: {
                userId: true,
                clinicName: true,
                city: true,
                location: true
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
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// Get all treatments (for admins, clinics, and secretaries)
router.get('/', authenticate, authorize('Admin', 'Clinic', 'Secretary'), async (req, res) => {
  try {
    let whereClause = {};
    
    // For Secretary, filter treatments by their clinic's dentists
    if (req.user.role === 'Secretary') {
      // Get secretary's clinic
      const secretary = await prisma.secretary.findUnique({
        where: { userId: req.user.id },
        select: { clinicId: true }
      });
      
      if (!secretary) {
        return res.status(404).json({ error: 'Secretary profile not found' });
      }
      
      // Get all dentists in the clinic
      const dentistsInClinic = await prisma.dentist.findMany({
        where: { clinicId: secretary.clinicId },
        select: { userId: true }
      });
      
      const dentistIds = dentistsInClinic.map(d => d.userId);
      whereClause = { dentistId: { in: dentistIds } };
    }
    
    const treatments = await prisma.treatment.findMany({
      where: whereClause,
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
            },
            clinic: {
              select: {
                userId: true,
                clinicName: true,
                city: true,
                location: true
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
    res.status(500).json({ error: 'Failed to fetch treatment' });
  }
});

// Create new treatment
router.post('/', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { 
      patientId, 
      treatmentName, 
      description, 
      totalAmount, 
      notes,
      teethStatus 
    } = req.body;

    // Validate required fields
    if (!patientId || !treatmentName) {
      return res.status(400).json({ error: 'Patient ID and treatment name are required' });
    }

    // Check if patient exists
    const patient = await validateEntityExists(prisma, 'patient', patientId, 'Patient', res, 'userId');
    if (!patient) return;

    const treatment = await prisma.treatment.create({
      data: {
        patientId: parseInt(patientId),
        dentistId,
        treatmentName,
        description,
        totalAmount: parseFloat(totalAmount) || 0,
        treatmentDiscount: 0, // Initialize with 0, will be updated when payments with discounts are made
        paidAmount: 0, // Initialize with 0
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

    // Send notification to patient
    const patientName = `${treatment.patient.firstName} ${treatment.patient.lastName}`;
    await sendTreatmentNotification(
      treatment.patientId,
      'New Treatment Plan',
      `A new treatment plan for ${treatmentName} has been created. Total amount: $${totalAmount || 0}`,
      {
        treatmentId: treatment.id,
        treatmentName: treatmentName,
        totalAmount: totalAmount || 0
      }
    );

    res.status(201).json({ 
      message: 'Treatment created successfully', 
      treatment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create treatment' });
  }
});

// Update treatment
router.put('/:id', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const { id } = req.params;
    const dentistId = req.user.id;
    const { 
      treatmentName, 
      description, 
      status,
      totalAmount, 
      paidAmount,
      treatmentDiscount,
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
    if (treatmentName) updateData.treatmentName = treatmentName;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (treatmentDiscount !== undefined) updateData.treatmentDiscount = parseFloat(treatmentDiscount);
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

    // Send notification to patient if status changed
    if (status && status !== existingTreatment.status) {
      let statusMessage = '';
      if (status === 'COMPLETED') {
        statusMessage = 'Your treatment has been completed successfully.';
      } else if (status === 'IN_PROGRESS') {
        statusMessage = 'Your treatment is now in progress.';
      } else if (status === 'CANCELLED') {
        statusMessage = 'Your treatment has been cancelled.';
      }

      if (statusMessage) {
        await sendTreatmentNotification(
          treatment.patientId,
          'Treatment Status Update',
          statusMessage,
          {
            treatmentId: treatment.id,
            status: status,
            treatmentName: treatment.treatmentName
          }
        );
      }
    }

    res.json({ 
      message: 'Treatment updated successfully', 
      treatment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update treatment' });
  }
});

// Get prescriptions for a treatment
router.get('/:id/prescriptions', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      select: { prescriptions: true, dentistId: true, patientId: true }
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    // Check access: dentist, patient, or admin
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Admin' && 
        treatment.dentistId !== userId && 
        treatment.patientId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const prescriptions = treatment.prescriptions || [];
    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Create prescription for a treatment
router.post('/:id/prescriptions', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const { id } = req.params;
    const dentistId = req.user.id;
    const { prescriptionDate, medications, notes } = req.body;

    // Validate required fields
    if (!prescriptionDate || !medications || medications.length === 0) {
      return res.status(400).json({ error: 'Prescription date and at least one medication are required' });
    }

    // Check if treatment exists and belongs to dentist
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      select: { 
        id: true, 
        dentistId: true, 
        prescriptions: true,
        patient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    if (treatment.dentistId !== dentistId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get existing prescriptions
    const existingPrescriptions = treatment.prescriptions || [];
    
    // Generate prescription number
    const year = new Date().getFullYear();
    const count = existingPrescriptions.length + 1;
    const prescriptionNumber = `RX-${year}-${String(count).padStart(4, '0')}`;

    // Create new prescription object
    const newPrescription = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prescriptionNumber,
      prescriptionDate,
      medications: medications.filter(m => m.name && m.name.trim()),
      notes: notes || '',
      createdAt: new Date().toISOString(),
      createdBy: dentistId,
      patientId: treatment.patient.userId,
      patientName: `${treatment.patient.firstName} ${treatment.patient.lastName}`
    };

    // Add to existing prescriptions
    const updatedPrescriptions = [...existingPrescriptions, newPrescription];

    // Update treatment with new prescriptions
    await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: {
        prescriptions: updatedPrescriptions
      }
    });

    res.status(201).json({ 
      message: 'Prescription created successfully',
      prescription: newPrescription 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Delete prescription from a treatment
router.delete('/:id/prescriptions/:prescriptionId', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const { id, prescriptionId } = req.params;
    const dentistId = req.user.id;

    // Check if treatment exists and belongs to dentist
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      select: { dentistId: true, prescriptions: true }
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    if (treatment.dentistId !== dentistId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get existing prescriptions and filter out the one to delete
    const existingPrescriptions = treatment.prescriptions || [];
    const updatedPrescriptions = existingPrescriptions.filter(p => p.id !== prescriptionId);

    if (existingPrescriptions.length === updatedPrescriptions.length) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Update treatment
    await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: {
        prescriptions: updatedPrescriptions
      }
    });

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prescription' });
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
    res.status(500).json({ error: 'Failed to delete treatment' });
  }
});

module.exports = router;
