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
        { 'address.city': searchRegex },
        { 'address.street': searchRegex }
      ];
    }

    // Filter by city
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Filter by supported type
    if (type) {
      query['supportedTypes.name'] = type;
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

module.exports = router;