const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authenticate, authorize, clinicStaffOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients (Admin, Clinic staff only)
// @access  Private
router.get('/', authenticate, clinicStaffOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city } = req.query;
    
    // Build query
    let query = {};
    
    // If search term provided, search in firstName, lastName, or email
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const userIds = await User.find({
        $or: [
          { email: searchRegex }
        ],
        role: 'Patient',
        status: 'active'
      }).distinct('_id');

      query = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { userId: { $in: userIds } }
        ]
      };
    }

    // Filter by city if provided
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'userId',
        select: '-password'
      },
      sort: { createdAt: -1 }
    };

    const patients = await Patient.find(query)
      .populate('userId', '-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patients'
    });
  }
});

// @route   GET /api/patients/me
// @desc    Get own patient profile
// @access  Private (Patient only)
router.get('/me', authenticate, async (req, res) => {
  try {
    // Only patients can access their own profile this way
    if (req.user.role !== 'Patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patient role required.'
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', '-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient profile'
    });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private (Own profile or clinic staff)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', '-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check permissions - patient can access own profile, clinic staff can access any
    const isOwnProfile = patient.userId._id.toString() === req.user._id.toString();
    const isClinicStaff = ['Admin', 'Dentist', 'Secretary', 'Clinic'].includes(req.user.role);

    if (!isOwnProfile && !isClinicStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Get patient error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching patient'
    });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (Own profile or clinic staff)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userData, patientData } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check permissions
    const isOwnProfile = patient.userId.toString() === req.user._id.toString();
    const isClinicStaff = ['Admin', 'Dentist', 'Secretary', 'Clinic'].includes(req.user.role);

    if (!isOwnProfile && !isClinicStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update user data if provided
    if (userData) {
      const allowedUserFields = ['phone', 'profileImage'];
      const userUpdateData = {};
      
      allowedUserFields.forEach(field => {
        if (userData[field] !== undefined) {
          userUpdateData[field] = userData[field];
        }
      });

      if (Object.keys(userUpdateData).length > 0) {
        await User.findByIdAndUpdate(patient.userId, userUpdateData, {
          new: true,
          runValidators: true
        });
      }
    }

    // Update patient data if provided
    if (patientData) {
      const allowedFields = [
        'firstName', 'lastName', 'gender', 'birthDate', 'address', 
        'medicalHistory', 'emergencyContact'
      ];
      
      // If patient is updating their own profile, allow limited fields
      if (isOwnProfile && !isClinicStaff) {
        const patientAllowedFields = ['firstName', 'lastName', 'address', 'emergencyContact'];
        allowedFields.splice(0, allowedFields.length, ...patientAllowedFields);
      }

      allowedFields.forEach(field => {
        if (patientData[field] !== undefined) {
          patient[field] = patientData[field];
        }
      });

      await patient.save();
    }

    // Get updated patient
    const updatedPatient = await Patient.findById(patient._id)
      .populate('userId', '-password');

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient
    });

  } catch (error) {
    console.error('Update patient error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating patient'
    });
  }
});

// @route   PUT /api/patients/:id/medical-history
// @desc    Update patient medical history (Clinic staff only)
// @access  Private (Clinic staff only)
router.put('/:id/medical-history', authenticate, clinicStaffOnly, async (req, res) => {
  try {
    const { medicalHistory } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { medicalHistory },
      { new: true, runValidators: true }
    ).populate('userId', '-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical history updated successfully',
      data: patient
    });

  } catch (error) {
    console.error('Update medical history error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating medical history'
    });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient (Admin only)
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Soft delete by updating user status
    await User.findByIdAndUpdate(patient.userId, { status: 'deleted' });

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting patient'
    });
  }
});

module.exports = router;