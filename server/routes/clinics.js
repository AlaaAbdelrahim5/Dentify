const express = require('express');
const Clinic = require('../models/Clinic');
const Dentist = require('../models/Dentist');
const Secretary = require('../models/Secretary');
const User = require('../models/User');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clinics
// @desc    Get all clinics (Public with optional auth for more details)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, service, sortBy = 'rating' } = req.query;
    
    // Build query
    let query = {};
    
    // Filter active clinics only (public access)
    const activeUserIds = await User.find({ 
      role: 'Clinic', 
      status: 'active' 
    }).distinct('_id');
    
    query.userId = { $in: activeUserIds };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { clinicName: searchRegex },
        { 'address.city': searchRegex },
        { 'address.street': searchRegex }
      ];
    }

    // Filter by city
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Filter by service
    if (service) {
      query['servicesAvailable.name'] = service;
    }

    // Sorting options
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'rating.average': -1 };
        break;
      case 'name':
        sortOptions = { clinicName: 1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { 'rating.average': -1 };
    }

    const clinics = await Clinic.find(query)
      .populate('userId', 'email phone profileImage status -_id')
      .populate('dentists', 'firstName lastName specialization')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Clinic.countDocuments(query);

    // If user is authenticated, provide more detailed information
    let responseData = clinics;
    if (req.user) {
      // Authenticated users get full details
      responseData = clinics;
    } else {
      // Public users get limited information
      responseData = clinics.map(clinic => ({
        _id: clinic._id,
        clinicName: clinic.clinicName,
        address: clinic.address,
        rating: clinic.rating,
        servicesAvailable: clinic.servicesAvailable.map(service => ({
          name: service.name,
          price: service.price
        })),
        workingHours: clinic.workingHours,
        facilities: clinic.facilities,
        contactInfo: {
          landline: clinic.contactInfo?.landline,
          website: clinic.contactInfo?.website
        }
      }));
    }

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
    console.error('Get clinics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinics'
    });
  }
});

// @route   GET /api/clinics/nearby
// @desc    Get nearby clinics
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const clinics = await Clinic.findNearby(
      parseFloat(longitude), 
      parseFloat(latitude), 
      parseInt(maxDistance)
    ).populate('userId', 'email phone profileImage status -_id');

    res.json({
      success: true,
      data: clinics,
      count: clinics.length
    });

  } catch (error) {
    console.error('Get nearby clinics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching nearby clinics'
    });
  }
});

// @route   GET /api/clinics/me
// @desc    Get own clinic profile
// @access  Private (Clinic only)
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Clinic') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Clinic role required.'
      });
    }

    const clinic = await Clinic.findOne({ userId: req.user._id })
      .populate('userId', '-password')
      .populate('dentists')
      .populate('secretaries');

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic profile not found'
      });
    }

    res.json({
      success: true,
      data: clinic
    });

  } catch (error) {
    console.error('Get clinic profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinic profile'
    });
  }
});

// @route   GET /api/clinics/:id
// @desc    Get clinic by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate('userId', req.user ? '-password' : 'email phone profileImage status -_id')
      .populate('dentists', 'firstName lastName specialization experience consultationFee')
      .populate('secretaries', 'firstName lastName');

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Check if clinic is active
    const user = await User.findById(clinic.userId);
    if (!user || user.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Clinic not available'
      });
    }

    res.json({
      success: true,
      data: clinic
    });

  } catch (error) {
    console.error('Get clinic error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching clinic'
    });
  }
});

// @route   PUT /api/clinics/:id
// @desc    Update clinic
// @access  Private (Own clinic or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userData, clinicData } = req.body;

    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Check permissions
    const isOwnClinic = clinic.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwnClinic && !isAdmin) {
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
        await User.findByIdAndUpdate(clinic.userId, userUpdateData, {
          new: true,
          runValidators: true
        });
      }
    }

    // Update clinic data if provided
    if (clinicData) {
      const allowedFields = [
        'clinicName', 'workingHours', 'address', 'location', 'servicesAvailable',
        'contactInfo', 'facilities', 'capacity'
      ];

      allowedFields.forEach(field => {
        if (clinicData[field] !== undefined) {
          clinic[field] = clinicData[field];
        }
      });

      await clinic.save();
    }

    // Get updated clinic
    const updatedClinic = await Clinic.findById(clinic._id)
      .populate('userId', '-password')
      .populate('dentists')
      .populate('secretaries');

    res.json({
      success: true,
      message: 'Clinic updated successfully',
      data: updatedClinic
    });

  } catch (error) {
    console.error('Update clinic error:', error);
    
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
      message: 'Server error updating clinic'
    });
  }
});

// @route   POST /api/clinics/:id/dentists
// @desc    Add dentist to clinic
// @access  Private (Clinic owner or Admin)
router.post('/:id/dentists', authenticate, async (req, res) => {
  try {
    const { dentistId } = req.body;

    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Check permissions
    const isOwnClinic = clinic.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwnClinic && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if dentist exists and is active
    const dentist = await Dentist.findById(dentistId);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    // Check if dentist is already in clinic
    if (clinic.dentists.includes(dentistId)) {
      return res.status(400).json({
        success: false,
        message: 'Dentist is already part of this clinic'
      });
    }

    // Add dentist to clinic
    clinic.dentists.push(dentistId);
    await clinic.save();

    // Update dentist's clinic reference
    dentist.clinicId = clinic._id;
    await dentist.save();

    const updatedClinic = await Clinic.findById(clinic._id)
      .populate('dentists', 'firstName lastName specialization');

    res.json({
      success: true,
      message: 'Dentist added to clinic successfully',
      data: updatedClinic
    });

  } catch (error) {
    console.error('Add dentist to clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding dentist to clinic'
    });
  }
});

// @route   GET /api/clinics/:id/services
// @desc    Get clinic services
// @access  Public
router.get('/:id/services', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).select('servicesAvailable');
    
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.json({
      success: true,
      data: clinic.servicesAvailable
    });

  } catch (error) {
    console.error('Get clinic services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinic services'
    });
  }
});

module.exports = router;