const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get radiology request statistics for dentist
router.get('/stats', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;

    const total = await prisma.radiologyRequest.count({
      where: { dentistId }
    });

    const requested = await prisma.radiologyRequest.count({
      where: { 
        dentistId,
        status: 'REQUESTED'
      }
    });

    const inProgress = await prisma.radiologyRequest.count({
      where: { 
        dentistId,
        status: 'IN_PROGRESS'
      }
    });

    const completed = await prisma.radiologyRequest.count({
      where: { 
        dentistId,
        status: 'COMPLETED'
      }
    });

    res.json({ 
      data: {
        total,
        requested,
        inProgress,
        completed
      }
    });
  } catch (error) {
    console.error('Error fetching radiology request stats:', error);
    res.status(500).json({ error: 'Failed to fetch radiology request statistics' });
  }
});

// Get all radiology requests for dentist
router.get('/dentist/my-requests', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { status, imagingType } = req.query;

    const where = { dentistId };
    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_');
    }
    if (imagingType && imagingType !== 'all') {
      where.imagingType = imagingType;
    }

    const radiologyRequests = await prisma.radiologyRequest.findMany({
      where,
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
        radiologyCenter: {
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
        treatment: {
          select: {
            id: true,
            treatmentType: true,
            description: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });

    res.json({ radiologyRequests });
  } catch (error) {
    console.error('Error fetching radiology requests:', error);
    res.status(500).json({ error: 'Failed to fetch radiology requests' });
  }
});

// Get all radiology requests for radiology center
router.get('/center/my-requests', authenticate, authorize('RadiologyCenter'), async (req, res) => {
  try {
    const radiologyCenterId = req.user.id;
    const { status } = req.query;

    const where = { radiologyCenterId };
    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_');
    }

    const radiologyRequests = await prisma.radiologyRequest.findMany({
      where,
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
        treatment: {
          select: {
            id: true,
            treatmentType: true,
            description: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });

    res.json({ radiologyRequests });
  } catch (error) {
    console.error('Error fetching radiology requests:', error);
    res.status(500).json({ error: 'Failed to fetch radiology requests' });
  }
});

// Get all radiology requests (Admin only)
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const radiologyRequests = await prisma.radiologyRequest.findMany({
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
        radiologyCenter: {
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
        treatment: {
          select: {
            id: true,
            treatmentType: true,
            description: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });

    res.json({ radiologyRequests });
  } catch (error) {
    console.error('Error fetching radiology requests:', error);
    res.status(500).json({ error: 'Failed to fetch radiology requests' });
  }
});

// Get radiology request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const radiologyRequest = await prisma.radiologyRequest.findUnique({
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
        radiologyCenter: {
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
        treatment: {
          select: {
            id: true,
            treatmentType: true,
            description: true
          }
        }
      }
    });

    if (!radiologyRequest) {
      return res.status(404).json({ error: 'Radiology request not found' });
    }

    res.json({ radiologyRequest });
  } catch (error) {
    console.error('Error fetching radiology request:', error);
    res.status(500).json({ error: 'Failed to fetch radiology request' });
  }
});

// Create new radiology request
router.post('/', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { 
      patientId, 
      radiologyCenterId, 
      treatmentId,
      imagingType, 
      notes 
    } = req.body;

    // Validate required fields
    if (!patientId || !radiologyCenterId || !imagingType) {
      return res.status(400).json({ 
        error: 'Patient ID, radiology center ID, and imaging type are required' 
      });
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { userId: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if radiology center exists
    const radiologyCenter = await prisma.radiologyCenter.findUnique({
      where: { userId: parseInt(radiologyCenterId) }
    });

    if (!radiologyCenter) {
      return res.status(404).json({ error: 'Radiology center not found' });
    }

    // Check if treatment exists (if provided)
    if (treatmentId) {
      const treatment = await prisma.treatment.findUnique({
        where: { id: parseInt(treatmentId) }
      });

      if (!treatment) {
        return res.status(404).json({ error: 'Treatment not found' });
      }

      if (treatment.dentistId !== dentistId) {
        return res.status(403).json({ error: 'Access denied to this treatment' });
      }
    }

    const radiologyRequest = await prisma.radiologyRequest.create({
      data: {
        patientId: parseInt(patientId),
        dentistId,
        radiologyCenterId: parseInt(radiologyCenterId),
        treatmentId: treatmentId ? parseInt(treatmentId) : null,
        imagingType,
        notes,
        status: 'REQUESTED'
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
        },
        radiologyCenter: {
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
      message: 'Radiology request created successfully', 
      radiologyRequest 
    });
  } catch (error) {
    console.error('Error creating radiology request:', error);
    res.status(500).json({ error: 'Failed to create radiology request' });
  }
});

// Update radiology request status (for radiology centers)
router.patch('/:id/status', authenticate, authorize('RadiologyCenter', 'Dentist', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, availableDate, reportFile } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Check if request exists
    const existingRequest = await prisma.radiologyRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Radiology request not found' });
    }

    // Check authorization
    if (userRole === 'RadiologyCenter' && existingRequest.radiologyCenterId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'Dentist' && existingRequest.dentistId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      status: status.toUpperCase().replace(' ', '_')
    };

    if (availableDate) updateData.availableDate = new Date(availableDate);
    if (reportFile !== undefined) updateData.reportFile = reportFile;

    const radiologyRequest = await prisma.radiologyRequest.update({
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
        },
        radiologyCenter: {
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
      message: 'Radiology request updated successfully', 
      radiologyRequest 
    });
  } catch (error) {
    console.error('Error updating radiology request:', error);
    res.status(500).json({ error: 'Failed to update radiology request' });
  }
});

// Update radiology request
router.put('/:id', authenticate, authorize('Dentist', 'RadiologyCenter', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { 
      imagingType, 
      notes, 
      status,
      availableDate,
      reportFile 
    } = req.body;

    // Check if request exists
    const existingRequest = await prisma.radiologyRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Radiology request not found' });
    }

    // Check authorization
    if (userRole === 'Dentist' && existingRequest.dentistId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'RadiologyCenter' && existingRequest.radiologyCenterId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (imagingType) updateData.imagingType = imagingType;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status.toUpperCase().replace(' ', '_');
    if (availableDate) updateData.availableDate = new Date(availableDate);
    if (reportFile !== undefined) updateData.reportFile = reportFile;

    const radiologyRequest = await prisma.radiologyRequest.update({
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
        },
        radiologyCenter: {
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
      message: 'Radiology request updated successfully', 
      radiologyRequest 
    });
  } catch (error) {
    console.error('Error updating radiology request:', error);
    res.status(500).json({ error: 'Failed to update radiology request' });
  }
});

// Delete radiology request
router.delete('/:id', authenticate, authorize('Dentist', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if request exists
    const radiologyRequest = await prisma.radiologyRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!radiologyRequest) {
      return res.status(404).json({ error: 'Radiology request not found' });
    }

    // Only allow dentist who created it or admin to delete
    if (userRole !== 'Admin' && radiologyRequest.dentistId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.radiologyRequest.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Radiology request deleted successfully' });
  } catch (error) {
    console.error('Error deleting radiology request:', error);
    res.status(500).json({ error: 'Failed to delete radiology request' });
  }
});

module.exports = router;
