const express = require('express');
const Secretary = require('../models/Secretary');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/secretaries
// @desc    Get all secretaries (Admin, Clinic only)
// @access  Private
router.get('/', authenticate, authorize(['Admin', 'Clinic']), async (req, res) => {
  try {
    const { clinicId } = req.query;
    
    let query = {};
    
    // Filter by clinic if provided
    if (clinicId) {
      query.clinicId = clinicId;
    }
    
    // If user is a clinic, only show their secretaries
    if (req.user.role === 'Clinic') {
      const clinic = await require('../models/Clinic').findOne({ userId: req.user._id });
      if (clinic) {
        query.clinicId = clinic._id;
      }
    }
    
    const secretaries = await Secretary.find(query)
      .populate('userId', '-password')
      .populate('clinicId', 'clinicName city location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: secretaries,
      count: secretaries.length
    });
  } catch (error) {
    console.error('Get secretaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching secretaries'
    });
  }
});

// @route   GET /api/secretaries/me
// @desc    Get own secretary profile
// @access  Private (Secretary only)
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Secretary') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Secretary role required.'
      });
    }

    const secretary = await Secretary.findOne({ userId: req.user._id })
      .populate('userId', '-password')
      .populate('clinicId');

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: 'Secretary profile not found'
      });
    }

    res.json({
      success: true,
      data: secretary
    });

  } catch (error) {
    console.error('Get secretary profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching secretary profile'
    });
  }
});

// @route   GET /api/secretaries/:id
// @desc    Get secretary by ID
// @access  Private (Own profile, Clinic, or Admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.params.id)
      .populate('userId', '-password')
      .populate('clinicId');

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: 'Secretary not found'
      });
    }

    // Check permissions
    const isOwnProfile = secretary.userId._id.toString() === req.user._id.toString();
    const isClinicOwner = req.user.role === 'Clinic'; // Would need additional logic to verify clinic ownership
    const isAdmin = req.user.role === 'Admin';

    if (!isOwnProfile && !isClinicOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: secretary
    });

  } catch (error) {
    console.error('Get secretary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching secretary'
    });
  }
});

// @route   PUT /api/secretaries/:id
// @desc    Update secretary
// @access  Private (Own profile, Clinic, or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userData, secretaryData } = req.body;

    const secretary = await Secretary.findById(req.params.id);
    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: 'Secretary not found'
      });
    }

    // Check permissions
    const isOwnProfile = secretary.userId.toString() === req.user._id.toString();
    const isClinicOwner = req.user.role === 'Clinic';
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
        await User.findByIdAndUpdate(secretary.userId, userUpdateData, {
          new: true,
          runValidators: true
        });
      }
    }

    // Update secretary data if provided
    if (secretaryData) {
      const allowedFields = [
        'firstName', 'lastName', 'birthDate', 'gender', 'address'
      ];

      allowedFields.forEach(field => {
        if (secretaryData[field] !== undefined) {
          secretary[field] = secretaryData[field];
        }
      });

      await secretary.save();
    }

    // Get updated secretary
    const updatedSecretary = await Secretary.findById(secretary._id)
      .populate('userId', '-password')
      .populate('clinicId');

    res.json({
      success: true,
      message: 'Secretary updated successfully',
      data: updatedSecretary
    });

  } catch (error) {
    console.error('Update secretary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating secretary'
    });
  }
});

module.exports = router;