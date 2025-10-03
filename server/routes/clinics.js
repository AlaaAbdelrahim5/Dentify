const express = require('express');
const Clinic = require('../models/Clinic');
const Dentist = require('../models/Dentist');
const Secretary = require('../models/Secretary');
const User = require('../models/User');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert working hours array to object format expected by frontend
const convertWorkingHoursToObject = (workingHoursArray) => {
  const daysMap = {
    'Sunday': 'sunday',
    'Monday': 'monday', 
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday'
  };
  
  const result = {};
  
  // Initialize all days as closed
  Object.values(daysMap).forEach(day => {
    result[day] = { isOpen: false, start: '', end: '' };
  });
  
  // Fill in the working hours
  workingHoursArray.forEach(({ day, startTime, endTime }) => {
    const dayKey = daysMap[day];
    if (dayKey) {
      result[dayKey] = {
        isOpen: true,
        start: startTime,
        end: endTime
      };
    }
  });
  
  return result;
};

// @route   GET /api/clinics
// @desc    Get all clinics (Public with optional auth for more details)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, service, sortBy = 'rating', isActive } = req.query;
    
    // Build query
    let query = {};
    
    // For admin users, show all clinics. For public users, show only active clinics
    if (!req.user || req.user.role !== 'Admin') {
      // Filter active clinics only (public access)
      const activeUserIds = await User.find({ 
        role: 'Clinic', 
        status: 'active' 
      }).distinct('_id');
      
      query.userId = { $in: activeUserIds };
    } else {
      // Admin can filter by active/inactive status
      if (isActive !== undefined) {
        if (isActive === 'true') {
          const activeUserIds = await User.find({ 
            role: 'Clinic', 
            status: 'active' 
          }).distinct('_id');
          query.userId = { $in: activeUserIds };
        } else if (isActive === 'false') {
          const inactiveUserIds = await User.find({ 
            role: 'Clinic', 
            status: { $ne: 'active' }
          }).distinct('_id');
          query.userId = { $in: inactiveUserIds };
        }
      }
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { clinicName: searchRegex },
        { city: searchRegex },
        { location: searchRegex }
      ];
    }

    // Filter by city
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    // Filter by service
    if (service) {
      query.servicesAvailable = service;
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

    // Format response based on user type
    let responseData;
    if (req.user && req.user.role === 'Admin') {
      // Admin users get full details with additional admin-specific fields
      responseData = clinics.map(clinic => ({
        _id: clinic._id,
        name: clinic.clinicName, // Map clinicName to name for frontend consistency
        clinicName: clinic.clinicName, // Keep original for backward compatibility
        description: clinic.description,
        address: {
          city: clinic.city,
          fullAddress: clinic.location
        },
        phone: { full: clinic.userId?.phone || 'N/A' },
        email: clinic.userId?.email,
        rating: clinic.rating,
        servicesAvailable: clinic.servicesAvailable,
        workingHours: clinic.workingHours ? convertWorkingHoursToObject(clinic.workingHours) : {},
        facilities: clinic.facilities,
        contactInfo: clinic.contactInfo,
        isActive: clinic.userId?.status === 'active', // Add isActive status
        doctors: clinic.dentists || [],
        secretaries: clinic.secretaries || [], // Add secretaries
        userId: clinic.userId,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt
      }));
    } else if (req.user) {
      // Other authenticated users get full details
      responseData = clinics.map(clinic => ({
        _id: clinic._id,
        name: clinic.clinicName,
        clinicName: clinic.clinicName,
        description: clinic.description,
        address: {
          city: clinic.city,
          fullAddress: clinic.location
        },
        phone: { full: clinic.userId?.phone || 'N/A' },
        email: clinic.userId?.email,
        rating: clinic.rating,
        servicesAvailable: clinic.servicesAvailable,
        workingHours: clinic.workingHours ? convertWorkingHoursToObject(clinic.workingHours) : {},
        facilities: clinic.facilities,
        contactInfo: clinic.contactInfo,
        isActive: clinic.userId?.status === 'active',
        doctors: clinic.dentists || [],
        secretaries: clinic.secretaries || []
      }));
    } else {
      // Public users get limited information
      responseData = clinics.map(clinic => ({
        _id: clinic._id,
        name: clinic.clinicName,
        clinicName: clinic.clinicName,
        address: {
          city: clinic.city,
          fullAddress: clinic.location
        },
        rating: clinic.rating,
        servicesAvailable: clinic.servicesAvailable,
        workingHours: clinic.workingHours ? convertWorkingHoursToObject(clinic.workingHours) : {},
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

// @route   GET /api/clinics/stats/overview
// @desc    Get clinic statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    // Get all clinics count
    const total = await Clinic.countDocuments();
    
    // Get active clinics (those with active user accounts)
    const activeUserIds = await User.find({ 
      role: 'Clinic', 
      status: 'active' 
    }).distinct('_id');
    
    const active = await Clinic.countDocuments({ userId: { $in: activeUserIds } });
    
    // Calculate inactive clinics
    const inactive = total - active;

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive
      }
    });

  } catch (error) {
    console.error('Get clinic stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinic statistics'
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

// @route   POST /api/clinics
// @desc    Create a new clinic (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const {
      // User data
      email,
      password,
      phone,
      // Clinic data
      clinicName,
      registrationNumber,
      city,
      location,
      website,
      description,
      servicesAvailable,
      workingHours
    } = req.body;

    // Validate required fields
    if (!email || !password || !phone || !clinicName || !registrationNumber || !city || !location) {
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
    const existingClinic = await Clinic.findOne({ registrationNumber });
    if (existingClinic) {
      return res.status(400).json({
        success: false,
        message: 'A clinic with this registration number already exists'
      });
    }

    // Create clinic with user using the model's static method
    const { user, clinic } = await Clinic.createWithUser(
      {
        email: email.toLowerCase(),
        password,
        phone,
        role: 'Clinic'
      },
      {
        clinicName,
        registrationNumber,
        city,
        location,
        website,
        description,
        servicesAvailable: servicesAvailable || [],
        workingHours: workingHours || []
      }
    );

    // Populate user data for response
    const populatedClinic = await Clinic.findById(clinic._id).populate('userId', 'email phone profileImage');

    res.status(201).json({
      success: true,
      message: 'Clinic created successfully',
      data: populatedClinic
    });

  } catch (error) {
    console.error('Create clinic error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A clinic with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating clinic'
    });
  }
});

// @route   PUT /api/clinics/:id
// @desc    Update a clinic (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const {
      // User data
      email,
      password,
      phone,
      // Clinic data
      clinicName,
      registrationNumber,
      city,
      location,
      website,
      description,
      servicesAvailable,
      workingHours
    } = req.body;

    // Find the clinic
    const clinic = await Clinic.findById(req.params.id).populate('userId');
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Update user data if provided
    if (email || phone || password) {
      const userUpdateData = {};
      if (email) userUpdateData.email = email.toLowerCase();
      if (phone) userUpdateData.phone = phone;
      if (password) userUpdateData.password = password;

      await User.findByIdAndUpdate(clinic.userId._id, userUpdateData);
    }

    // Prepare clinic update data
    const clinicUpdateData = {};
    if (clinicName) clinicUpdateData.clinicName = clinicName;
    if (registrationNumber) clinicUpdateData.registrationNumber = registrationNumber;
    if (city) clinicUpdateData.city = city;
    if (location) clinicUpdateData.location = location;
    if (website !== undefined) clinicUpdateData.website = website;
    if (description !== undefined) clinicUpdateData.description = description;
    if (servicesAvailable) clinicUpdateData.servicesAvailable = servicesAvailable;
    if (workingHours) clinicUpdateData.workingHours = workingHours;

    // Update clinic
    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      clinicUpdateData,
      { new: true, runValidators: true }
    ).populate('userId', 'email phone profileImage');

    res.json({
      success: true,
      message: 'Clinic updated successfully',
      data: updatedClinic
    });

  } catch (error) {
    console.error('Update clinic error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A clinic with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating clinic'
    });
  }
});

module.exports = router;