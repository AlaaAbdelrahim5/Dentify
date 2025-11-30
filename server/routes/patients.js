const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get patients statistics
router.get('/stats', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const total = await prisma.patient.count();
    const active = await prisma.user.count({
      where: {
        role: 'Patient',
        status: 'ACTIVE'
      }
    });

    res.json({ 
      data: {
        total,
        active
      }
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ error: 'Failed to fetch patient statistics' });
  }
});

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

    res.json({ 
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
});

// Get current patient's radiology requests
router.get('/my-radiology-requests', authenticate, authorize('Patient'), async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status, imagingType } = req.query;

    const where = { patientId };
    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_');
    }
    if (imagingType && imagingType !== 'all') {
      where.imagingType = imagingType;
    }

    const radiologyRequests = await prisma.radiologyRequest.findMany({
      where,
      include: {
        dentist: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        radiologyCenter: {
          select: {
            userId: true,
            centerName: true,
            city: true,
            location: true
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

    res.json({ 
      success: true,
      data: radiologyRequests 
    });
  } catch (error) {
    console.error('Error fetching patient radiology requests:', error);
    res.status(500).json({ error: 'Failed to fetch radiology requests' });
  }
});

// Get all patients
router.get('/', authenticate, authorize('Dentist', 'Clinic', 'Secretary', 'Admin'), async (req, res) => {
  try {
    // For Clinic or Secretary, filter patients by their clinic
    let whereClause = {};
    
    if (req.user.role === 'Clinic' || req.user.role === 'Secretary') {
      let clinicId;
      
      if (req.user.role === 'Clinic') {
        // For clinic users, the userId is directly the clinicId
        const clinic = await prisma.clinic.findUnique({
          where: { userId: req.user.id },
          select: { userId: true }
        });
        
        if (!clinic) {
          return res.status(404).json({ error: 'Clinic profile not found' });
        }
        
        clinicId = clinic.userId;
      } else if (req.user.role === 'Secretary') {
        // Get secretary's clinic
        const secretary = await prisma.secretary.findUnique({
          where: { userId: req.user.id },
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
      
      // Get all patients who have treatments with these dentists
      const treatments = await prisma.treatment.findMany({
        where: { dentistId: { in: dentistIds } },
        select: { patientId: true },
        distinct: ['patientId']
      });
      
      const patientIds = treatments.map(t => t.patientId);
      whereClause = { userId: { in: patientIds } };
    }
    
    const patients = await prisma.patient.findMany({
      where: whereClause,
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
    console.error('Error fetching patients:', error);
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

// Create new patient (for dentists/clinics/admins)
router.post('/', authenticate, authorize('Dentist', 'Clinic', 'Admin'), async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, gender, birthDate, city } = req.body;

    // Validate required fields
    if (!email || !password || !phone || !firstName || !lastName || !birthDate || !city) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and patient in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone,
          role: 'Patient',
          status: 'ACTIVE'
        }
      });

      // Create patient profile
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          gender: gender || null,
          birthDate: new Date(birthDate),
          city
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

      return patient;
    });

    res.status(201).json({ 
      message: 'Patient created successfully', 
      patient: result 
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, gender, city, birthDate } = req.body;

    // Check if user can update (must be own profile or dentist/clinic/admin)
    const allowedRoles = ['Patient', 'Dentist', 'Clinic', 'Admin'];
    if (req.user.id !== id && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (gender) updateData.gender = gender;
    if (city) updateData.city = city;
    if (birthDate) updateData.birthDate = new Date(birthDate);

    const patient = await prisma.patient.update({
      where: { userId: parseInt(id) },
      data: updateData,
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

    res.json({ 
      success: true,
      data: patient,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

module.exports = router;
