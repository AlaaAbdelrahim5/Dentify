const express = require('express');
const RadiologyCenter = require('../models/RadiologyCenter');
const User = require('../models/User');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/radiology-centers
// @desc    Get all radiology centers (Public)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, type } = req.query;
    
    // Filter active centers only
    const activeUserIds = await User.find({ 
      role: 'RadiologyCenter', 
      status: 'active' 
    }).distinct('_id');
    
    let query = { userId: { $in: activeUserIds } };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { centerName: searchRegex },
        { city: searchRegex },
        { location: searchRegex }
      ];
    }

    // Filter by city
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    // Filter by supported type
    if (type) {
      query.supportedTypes = type;
    }

    const centers = await RadiologyCenter.find(query)
      .populate('userId', 'email phone profileImage -_id')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RadiologyCenter.countDocuments(query);

    // Public users get limited information
    let responseData = centers.map(center => ({
      _id: center._id,
      centerName: center.centerName,
      address: center.address,
      workingHours: center.workingHours,
      supportedTypes: center.supportedTypes.map(type => ({
        name: type.name,
        price: type.price,
        duration: type.duration
      })),
      rating: center.rating,
      facilities: center.facilities,
      contactInfo: {
        landline: center.contactInfo?.landline,
        website: center.contactInfo?.website
      }
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
    console.error('Get radiology centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching radiology centers'
    });
  }
});

// @route   GET /api/radiology-centers/nearby
// @desc    Get nearby radiology centers
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

    const centers = await RadiologyCenter.findNearby(
      parseFloat(longitude), 
      parseFloat(latitude), 
      parseInt(maxDistance)
    ).populate('userId', 'email phone profileImage -_id');

    res.json({
      success: true,
      data: centers,
      count: centers.length
    });

  } catch (error) {
    console.error('Get nearby radiology centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching nearby radiology centers'
    });
  }
});

// @route   GET /api/radiology-centers/me
// @desc    Get own radiology center profile
// @access  Private (RadiologyCenter only)
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'RadiologyCenter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Radiology Center role required.'
      });
    }

    const center = await RadiologyCenter.findOne({ userId: req.user._id })
      .populate('userId', '-password');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Radiology center profile not found'
      });
    }

    res.json({
      success: true,
      data: center
    });

  } catch (error) {
    console.error('Get radiology center profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching radiology center profile'
    });
  }
});

// @route   GET /api/radiology-centers/:id
// @desc    Get radiology center by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const center = await RadiologyCenter.findById(req.params.id)
      .populate('userId', 'email phone profileImage');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Radiology center not found'
      });
    }

    // Check if center is active
    const user = await User.findById(center.userId);
    if (!user || user.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Radiology center not available'
      });
    }

    res.json({
      success: true,
      data: center
    });

  } catch (error) {
    console.error('Get radiology center error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching radiology center'
    });
  }
});

// @route   GET /api/radiology-centers/types/list
// @desc    Get list of all supported imaging types
// @access  Public
router.get('/types/list', async (req, res) => {
  try {
    const imagingTypes = [
      'Panoramic X-Ray',
      'CBCT (Cone Beam CT)',
      'Intraoral X-Ray',
      'Cephalometric X-Ray',
      'TMJ X-Ray',
      '3D Imaging',
      'Digital X-Ray',
      'Bitewing X-Ray',
      'Periapical X-Ray'
    ];

    res.json({
      success: true,
      data: imagingTypes
    });

  } catch (error) {
    console.error('Get imaging types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching imaging types'
    });
  }
});

// @route   POST /api/radiology-centers
// @desc    Create a new radiology center (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const {
      // User data
      email,
      password,
      phone,
      // RadiologyCenter data
      centerName,
      registrationNumber,
      city,
      location,
      website,
      description,
      supportedTypes,
      workingHours
    } = req.body;

    // Validate required fields
    if (!email || !password || !phone || !centerName || !registrationNumber || !city || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Check if registration number already exists
    const existingCenter = await RadiologyCenter.findOne({ registrationNumber });
    if (existingCenter) {
      return res.status(400).json({
        success: false,
        message: 'A radiology center with this registration number already exists'
      });
    }

    // Create radiology center with user using the model's static method
    const { user, center } = await RadiologyCenter.createWithUser(
      {
        email: email.toLowerCase(),
        password,
        phone,
        role: 'RadiologyCenter'
      },
      {
        centerName,
        registrationNumber,
        city,
        location,
        website,
        description,
        supportedTypes: supportedTypes || [],
        workingHours: workingHours || []
      }
    );

    // Populate user data for response
    const populatedCenter = await RadiologyCenter.findById(center._id).populate('userId', 'email phone profileImage');

    res.status(201).json({
      success: true,
      message: 'Radiology center created successfully',
      data: populatedCenter
    });

  } catch (error) {
    console.error('Create radiology center error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A radiology center with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating radiology center'
    });
  }
});

// @route   PUT /api/radiology-centers/:id
// @desc    Update a radiology center (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const {
      // User data
      email,
      password,
      phone,
      // RadiologyCenter data
      centerName,
      registrationNumber,
      city,
      location,
      website,
      description,
      supportedTypes,
      workingHours
    } = req.body;

    // Find the radiology center
    const center = await RadiologyCenter.findById(req.params.id).populate('userId');
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Radiology center not found'
      });
    }

    // Update user data if provided
    if (email || phone || password) {
      const userUpdateData = {};
      if (email) userUpdateData.email = email.toLowerCase();
      if (phone) userUpdateData.phone = phone;
      if (password) userUpdateData.password = password;

      await User.findByIdAndUpdate(center.userId._id, userUpdateData);
    }

    // Prepare center update data
    const centerUpdateData = {};
    if (centerName) centerUpdateData.centerName = centerName;
    if (registrationNumber) centerUpdateData.registrationNumber = registrationNumber;
    if (city) centerUpdateData.city = city;
    if (location) centerUpdateData.location = location;
    if (website !== undefined) centerUpdateData.website = website;
    if (description !== undefined) centerUpdateData.description = description;
    if (supportedTypes) centerUpdateData.supportedTypes = supportedTypes;
    if (workingHours) centerUpdateData.workingHours = workingHours;

    // Update radiology center
    const updatedCenter = await RadiologyCenter.findByIdAndUpdate(
      req.params.id,
      centerUpdateData,
      { new: true, runValidators: true }
    ).populate('userId', 'email phone profileImage');

    res.json({
      success: true,
      message: 'Radiology center updated successfully',
      data: updatedCenter
    });

  } catch (error) {
    console.error('Update radiology center error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A radiology center with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating radiology center'
    });
  }
});

module.exports = router;