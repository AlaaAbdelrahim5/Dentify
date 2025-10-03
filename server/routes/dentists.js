const express = require('express');
const Dentist = require('../models/Dentist');
const User = require('../models/User');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dentists
// @desc    Get all dentists
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, specialization, clinicId } = req.query;
    
    // Build query for active dentists only
    const activeUserIds = await User.find({ 
      role: 'Dentist', 
      status: 'active' 
    }).distinct('_id');
    
    let query = { userId: { $in: activeUserIds } };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { specialization: { $in: [searchRegex] } }
      ];
    }

    // Filter by city
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Filter by specialization
    if (specialization) {
      query.specialization = { $in: [specialization] };
    }

    // Filter by clinic
    if (clinicId) {
      query.clinicId = clinicId;
    }

    const dentists = await Dentist.find(query)
      .populate('userId', 'email phone profileImage -_id')
      .populate('clinicId', 'clinicName address contactInfo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dentist.countDocuments(query);

    // Public users get limited information
    let responseData = dentists.map(dentist => ({
      _id: dentist._id,
      firstName: dentist.firstName,
      lastName: dentist.lastName,
      fullName: dentist.fullName,
      specialization: dentist.specialization,
      experience: dentist.experience,
      consultationFee: dentist.consultationFee,
      workingHours: dentist.workingHours,
      clinic: dentist.clinicId ? {
        _id: dentist.clinicId._id,
        clinicName: dentist.clinicId.clinicName,
        address: dentist.clinicId.address
      } : null,
      profileImage: dentist.userId?.profileImage
    }));

    res.json({
      success: true,
      data: responseData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get dentists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dentists'
    });
  }
});

// @route   GET /api/dentists/me
// @desc    Get own dentist profile
// @access  Private (Dentist only)
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Dentist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Dentist role required.'
      });
    }

    const dentist = await Dentist.findOne({ userId: req.user._id })
      .populate('userId', '-password')
      .populate('clinicId');

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist profile not found'
      });
    }

    res.json({
      success: true,
      data: dentist
    });

  } catch (error) {
    console.error('Get dentist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dentist profile'
    });
  }
});

// @route   GET /api/dentists/:id
// @desc    Get dentist by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.id)
      .populate('userId', 'email phone profileImage')
      .populate('clinicId', 'clinicName address contactInfo workingHours');

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    // Check if dentist is active
    const user = await User.findById(dentist.userId);
    if (!user || user.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Dentist not available'
      });
    }

    res.json({
      success: true,
      data: dentist
    });

  } catch (error) {
    console.error('Get dentist error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching dentist'
    });
  }
});

// @route   PUT /api/dentists/:id
// @desc    Update dentist
// @access  Private (Own profile, Clinic, or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userData, dentistData } = req.body;

    const dentist = await Dentist.findById(req.params.id);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    // Check permissions
    const isOwnProfile = dentist.userId.toString() === req.user._id.toString();
    const isClinicOwner = req.user.role === 'Clinic'; // Would need to check if they own the clinic
    const isAdmin = req.user.role === 'Admin';

    if (!isOwnProfile && !isClinicOwner && !isAdmin) {
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
        await User.findByIdAndUpdate(dentist.userId, userUpdateData, {
          new: true,
          runValidators: true
        });
      }
    }

    // Update dentist data if provided
    if (dentistData) {
      const allowedFields = [
        'firstName', 'lastName', 'specialization', 'address', 'workingHours',
        'appointmentDuration', 'socialLinks', 'education', 'experience', 'consultationFee'
      ];

      // License number can only be updated by admin
      if (isAdmin && dentistData.licenseNumber) {
        allowedFields.push('licenseNumber');
      }

      allowedFields.forEach(field => {
        if (dentistData[field] !== undefined) {
          dentist[field] = dentistData[field];
        }
      });

      await dentist.save();
    }

    // Get updated dentist
    const updatedDentist = await Dentist.findById(dentist._id)
      .populate('userId', '-password')
      .populate('clinicId');

    res.json({
      success: true,
      message: 'Dentist updated successfully',
      data: updatedDentist
    });

  } catch (error) {
    console.error('Update dentist error:', error);
    
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
      message: 'Server error updating dentist'
    });
  }
});

// @route   GET /api/dentists/specializations/list
// @desc    Get list of all specializations
// @access  Public
router.get('/specializations/list', async (req, res) => {
  try {
    const specializations = [
      'General Dentistry',
      'Orthodontics',
      'Endodontics',
      'Periodontics',
      'Oral Surgery',
      'Prosthodontics',
      'Pediatric Dentistry',
      'Oral Pathology',
      'Cosmetic Dentistry',
      'Implantology'
    ];

    res.json({
      success: true,
      data: specializations
    });

  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching specializations'
    });
  }
});

module.exports = router;