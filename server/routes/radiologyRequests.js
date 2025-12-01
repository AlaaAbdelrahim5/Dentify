const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const { db, admin } = require('../config/firebase-admin');

// Helper function to send radiology notifications
const sendRadiologyNotification = async (userId, title, body, data = {}) => {
  try {
    await db.collection('notifications').add({
      userId: String(userId),
      title,
      body,
      type: 'radiology',
      data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending radiology notification:', error);
  }
};

// Get radiology request statistics for dentist or radiology center
router.get('/stats', authenticate, authorize('Dentist', 'RadiologyCenter'), async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};
    
    if (userRole === 'Dentist') {
      whereClause.dentistId = userId;
    } else if (userRole === 'RadiologyCenter') {
      whereClause.radiologyCenterId = userId;
    }

    const total = await prisma.radiologyRequest.count({
      where: whereClause
    });

    const requested = await prisma.radiologyRequest.count({
      where: { 
        ...whereClause,
        status: 'REQUESTED'
      }
    });

    const inProgress = await prisma.radiologyRequest.count({
      where: { 
        ...whereClause,
        status: 'IN_PROGRESS'
      }
    });

    const completed = await prisma.radiologyRequest.count({
      where: { 
        ...whereClause,
        status: 'COMPLETED'
      }
    });

    // For radiology center, also get completed today and this month
    let completedToday = 0;
    let completedThisMonth = 0;

    if (userRole === 'RadiologyCenter') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      completedToday = await prisma.radiologyRequest.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          availableDate: {
            gte: today
          }
        }
      });

      completedThisMonth = await prisma.radiologyRequest.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          availableDate: {
            gte: startOfMonth
          }
        }
      });
    }

    res.json({ 
      data: {
        totalRequests: total,
        pendingRequests: requested,
        completedToday,
        completedThisMonth,
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
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        },
        radiologyCenter: {
          select: {
            userId: true,
            centerName: true
          }
        },
        treatment: {
          select: {
            id: true,
            treatmentType: true
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

    // Send notification to patient
    const patientName = `${radiologyRequest.patient.firstName} ${radiologyRequest.patient.lastName}`;
    await sendRadiologyNotification(
      radiologyRequest.patientId,
      'Radiology Request Created',
      `A radiology request for ${imagingType} has been submitted to ${radiologyRequest.radiologyCenter.user.email}.`,
      {
        requestId: radiologyRequest.id,
        imagingType: imagingType,
        status: 'REQUESTED'
      }
    );

    // Send notification to radiology center
    await sendRadiologyNotification(
      radiologyRequest.radiologyCenterId,
      'New Radiology Request',
      `New ${imagingType} request for patient ${patientName}.`,
      {
        requestId: radiologyRequest.id,
        imagingType: imagingType,
        patientName: patientName
      }
    );

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
        },
        dentist: {
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

    // Send notifications based on status change
    if (status && status.toUpperCase().replace(' ', '_') !== existingRequest.status) {
      const patientName = `${radiologyRequest.patient.firstName} ${radiologyRequest.patient.lastName}`;
      const newStatus = status.toUpperCase().replace(' ', '_');
      
      // Notify patient about status change
      let patientMessage = '';
      if (newStatus === 'IN_PROGRESS') {
        patientMessage = `Your radiology request for ${radiologyRequest.imagingType} is now being processed.`;
      } else if (newStatus === 'COMPLETED') {
        patientMessage = `Your radiology results for ${radiologyRequest.imagingType} are now available.`;
      } else if (newStatus === 'CANCELLED') {
        patientMessage = `Your radiology request for ${radiologyRequest.imagingType} has been cancelled.`;
      }

      if (patientMessage) {
        await sendRadiologyNotification(
          radiologyRequest.patientId,
          'Radiology Status Update',
          patientMessage,
          {
            requestId: radiologyRequest.id,
            status: newStatus,
            imagingType: radiologyRequest.imagingType,
            availableDate: availableDate
          }
        );
      }

      // Notify dentist about completed results
      if (newStatus === 'COMPLETED' && radiologyRequest.dentistId) {
        await sendRadiologyNotification(
          radiologyRequest.dentistId,
          'Radiology Results Available',
          `Radiology results for ${patientName} (${radiologyRequest.imagingType}) are now available.`,
          {
            requestId: radiologyRequest.id,
            patientName: patientName,
            imagingType: radiologyRequest.imagingType
          }
        );
      }
    }

    res.json({ 
      message: 'Radiology request updated successfully', 
      radiologyRequest 
    });
  } catch (error) {
    console.error('Error updating radiology request:', error);
    res.status(500).json({ error: 'Failed to update radiology request' });
  }
});

// Upload result for radiology request (convenience endpoint for radiology centers)
router.patch('/:id/upload-result', authenticate, authorize('RadiologyCenter'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reportFile, availableDate, status, notes } = req.body;

    if (!reportFile) {
      return res.status(400).json({ error: 'Report file URL is required' });
    }

    // Check if request exists and belongs to this radiology center
    const existingRequest = await prisma.radiologyRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Radiology request not found' });
    }

    if (existingRequest.radiologyCenterId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      reportFile,
      availableDate: availableDate ? new Date(availableDate) : new Date(),
      status: status || 'COMPLETED'
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

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
        }
      }
    });

    // Send notifications about completed results
    const patientName = `${radiologyRequest.patient.firstName} ${radiologyRequest.patient.lastName}`;
    
    // Notify patient
    await sendRadiologyNotification(
      radiologyRequest.patientId,
      'Radiology Results Available',
      `Your radiology results for ${radiologyRequest.imagingType} are now available.`,
      {
        requestId: radiologyRequest.id,
        imagingType: radiologyRequest.imagingType,
        status: 'COMPLETED'
      }
    );

    // Notify dentist if exists
    if (radiologyRequest.dentistId) {
      await sendRadiologyNotification(
        radiologyRequest.dentistId,
        'Radiology Results Available',
        `Radiology results for ${patientName} (${radiologyRequest.imagingType}) are now available.`,
        {
          requestId: radiologyRequest.id,
          patientName: patientName,
          imagingType: radiologyRequest.imagingType
        }
      );
    }

    res.json({ 
      success: true,
      message: 'Result uploaded successfully', 
      data: radiologyRequest 
    });
  } catch (error) {
    console.error('Error uploading result:', error);
    res.status(500).json({ error: 'Failed to upload result' });
  }
});

// Update radiology request (full update)
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
