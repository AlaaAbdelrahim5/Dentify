const express = require('express');
const Dentist = require('../models/Dentist');
const User = require('../models/User');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dentists/stats
// @desc    Get dentist statistics (Admin only)
// @access  Private (Admin only)
router.get('/stats', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'Dentist' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      active: 0,
      suspended: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      if (stat._id === 'pending') result.pending = stat.count;
      if (stat._id === 'active') result.active = stat.count;
      if (stat._id === 'suspended') result.suspended = stat.count;
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get dentist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dentist statistics'
    });
  }
});

// @route   PATCH /api/dentists/:id/approve
// @desc    Approve a dentist (Admin only)
// @access  Private (Admin only)
router.patch('/:id/approve', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.id);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    // Update user status to active
    await User.findByIdAndUpdate(dentist.userId, { status: 'active' });

    res.json({
      success: true,
      message: 'Dentist approved successfully'
    });

  } catch (error) {
    console.error('Approve dentist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving dentist'
    });
  }
});

// @route   PATCH /api/dentists/:id/suspend
// @desc    Suspend a dentist (Admin only)
// @access  Private (Admin only)
router.patch('/:id/suspend', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.id);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    // Update user status to suspended
    await User.findByIdAndUpdate(dentist.userId, { status: 'suspended' });

    res.json({
      success: true,
      message: 'Dentist suspended successfully'
    });

  } catch (error) {
    console.error('Suspend dentist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error suspending dentist'
    });
  }
});

// @route   GET /api/dentists
// @desc    Get all dentists
// @access  Public/Private (optionally authenticated)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, specialization, clinicId, includeAll, status } = req.query;
    
    let userQuery = { role: 'Dentist' };
    
    // For admin users, include all statuses if includeAll is true
    if (req.user && req.user.role === 'Admin' && includeAll === 'true') {
      // Include all user statuses for admin
      if (status) {
        userQuery.status = status;
      }
    } else {
      // For public/non-admin users, only show active dentists
      userQuery.status = 'active';
    }
    
    const userIds = await User.find(userQuery).distinct('_id');
    
    let query = { userId: { $in: userIds } };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { licenseNumber: searchRegex },
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

    // Filter by clinic - prioritize user's clinic if they're authenticated as clinic
    if (req.user && req.user.role === 'Clinic') {
      // If user is a clinic, only show their dentists
      const clinic = await require('../models/Clinic').findOne({ userId: req.user._id });
      if (clinic) {
        query.clinicId = clinic._id;
      }
    } else if (clinicId) {
      // Otherwise use the provided clinicId parameter
      query.clinicId = clinicId;
    }

    const dentists = await Dentist.find(query)
      .populate('userId', 'email phone profileImage status createdAt')
      .populate('clinicId', 'clinicName city location website')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dentist.countDocuments(query);

    // Format response data based on user role
    let responseData = dentists.map(dentist => {
      const baseData = {
        _id: dentist._id,
        firstName: dentist.firstName,
        lastName: dentist.lastName,
        fullName: dentist.fullName,
        licenseNumber: dentist.licenseNumber,
        specialization: dentist.specialization,
        gender: dentist.gender,
        birthDate: dentist.birthDate,
        address: dentist.address,
        workingHours: dentist.workingHours,
        appointmentDuration: dentist.appointmentDuration,
        socialLinks: dentist.socialLinks,
        clinic: dentist.clinicId ? {
          _id: dentist.clinicId._id,
          clinicName: dentist.clinicId.clinicName,
          city: dentist.clinicId.city,
          location: dentist.clinicId.location
        } : null,
        profileImage: dentist.userId?.profileImage,
        createdAt: dentist.createdAt
      };

      // Include additional data for admin users
      if (req.user && req.user.role === 'Admin') {
        baseData.status = dentist.userId?.status;
        baseData.user = {
          email: dentist.userId?.email,
          phone: dentist.userId?.phone,
          profileImage: dentist.userId?.profileImage,
          status: dentist.userId?.status,
          createdAt: dentist.userId?.createdAt
        };
      }

      return baseData;
    });

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

// @route   GET /api/dentists/clinic
// @desc    Get all dentists for the authenticated clinic
// @access  Private (Clinic only)
router.get('/clinic', authenticate, authorize(['Clinic']), async (req, res) => {
  try {
    // Get clinic ID for current user
    const clinic = await require('../models/Clinic').findOne({ userId: req.user._id });
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic profile not found for current user'
      });
    }

    // Get all dentists for this clinic (including pending ones)
    const dentists = await Dentist.find({ clinicId: clinic._id })
      .populate('userId', '-password')
      .populate('clinicId', 'clinicName city location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: dentists,
      count: dentists.length
    });

  } catch (error) {
    console.error('Get clinic dentists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinic dentists'
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
      .populate('clinicId', 'clinicName city location website workingHours');

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

// @route   POST /api/dentists
// @desc    Create new dentist (clinic request to admin)
// @access  Private (Clinic only)
router.post('/', authenticate, authorize(['Clinic']), async (req, res) => {
  try {
    console.log('📝 Creating dentist request with data:', {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      licenseNumber: req.body.licenseNumber,
      specialization: req.body.specialization,
      hasAddress: !!req.body.address,
      userId: req.user._id
    });

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      licenseNumber,
      specialization,
      birthDate,
      gender,
      address,
      appointmentDuration = 30,
      workingHours = [],
      socialLinks = {}
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !licenseNumber || 
        !specialization || !birthDate || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if license number already exists
    const existingDentist = await Dentist.findOne({ licenseNumber });
    if (existingDentist) {
      return res.status(400).json({
        success: false,
        message: 'Dentist with this license number already exists'
      });
    }

    // Get clinic ID for current user
    const clinic = await require('../models/Clinic').findOne({ userId: req.user._id });
    if (!clinic) {
      return res.status(400).json({
        success: false,
        message: 'Clinic not found for current user'
      });
    }

    // Create new user with pending status (awaiting admin approval)
    const userData = {
      email,
      phone,
      password,
      role: 'Dentist',
      isActive: false, // Will be activated by admin
      status: 'pending' // Pending admin approval
    };

    const newUser = new User(userData);
    await newUser.save();

    // Create dentist profile
    const dentistData = {
      userId: newUser._id,
      firstName,
      lastName,
      licenseNumber,
      specialization: Array.isArray(specialization) ? specialization : [specialization],
      birthDate,
      gender,
      address: address || {},
      clinicId: clinic._id,
      appointmentDuration: parseInt(appointmentDuration),
      workingHours: workingHours || [],
      socialLinks: socialLinks || {}
    };

    const newDentist = new Dentist(dentistData);
    await newDentist.save();

    // Populate and return the new dentist
    const populatedDentist = await Dentist.findById(newDentist._id)
      .populate('userId', '-password')
      .populate('clinicId', 'clinicName city location');

    res.status(201).json({
      success: true,
      message: 'Dentist request sent to admin for approval',
      data: populatedDentist
    });

  } catch (error) {
    console.error('Create dentist error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      validationErrors: error.errors
    });
    
    // Clean up if user was created but dentist creation failed
    if (error.name === 'ValidationError' && req.body.email) {
      await User.findOneAndDelete({ email: req.body.email });
    }

    // Handle specific errors
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      if (error.keyPattern?.licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'Dentist with this license number already exists'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(', ')}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating dentist request',
      ...(process.env.NODE_ENV === 'development' && { 
        errorDetails: error.message,
        validationErrors: error.errors 
      })
    });
  }
});

// @route   PUT /api/dentists/:id
// @desc    Update dentist
// @access  Private (Own profile, Clinic, or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userData, dentistData } = req.body;
    console.log('📝 Updating dentist:', req.params.id);
    console.log('📝 User data:', userData);
    console.log('📝 Dentist data:', dentistData);

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
      const allowedUserFields = ['email', 'phone', 'profileImage', 'password'];
      const userUpdateData = {};
      
      allowedUserFields.forEach(field => {
        if (userData[field] !== undefined) {
          userUpdateData[field] = userData[field];
        }
      });

      if (Object.keys(userUpdateData).length > 0) {
        // Check if email is being updated and if it already exists
        if (userData.email) {
          const existingUser = await User.findOne({ 
            email: userData.email, 
            _id: { $ne: dentist.userId } 
          });
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: 'Email already exists'
            });
          }
        }

        await User.findByIdAndUpdate(dentist.userId, userUpdateData, {
          new: true,
          runValidators: true
        });
      }
    }

    // Update dentist data if provided
    if (dentistData) {
      const allowedFields = [
        'firstName', 'lastName', 'specialization', 'birthDate', 'gender', 'address', 'workingHours',
        'appointmentDuration', 'socialLinks'
      ];

      // License number can only be updated by admin
      if (isAdmin && dentistData.licenseNumber) {
        allowedFields.push('licenseNumber');
      }

      // Check for license number uniqueness if it's being updated
      if (dentistData.licenseNumber && dentistData.licenseNumber !== dentist.licenseNumber) {
        const existingDentist = await Dentist.findOne({ 
          licenseNumber: dentistData.licenseNumber,
          _id: { $ne: dentist._id }
        });
        
        if (existingDentist) {
          return res.status(400).json({
            success: false,
            message: 'License number already exists'
          });
        }
      }

      allowedFields.forEach(field => {
        if (dentistData[field] !== undefined) {
          // Special handling for address to preserve existing city if not provided
          if (field === 'address' && dentistData[field] && !dentistData[field].city) {
            // If address is provided but city is empty, preserve existing city
            dentist[field] = {
              ...dentist[field],
              ...dentistData[field],
              city: dentist[field]?.city || dentistData[field].city
            };
          } else {
            dentist[field] = dentistData[field];
          }
        }
      });

      // Use validateBeforeSave: false to avoid re-validating required fields that aren't being updated
      await dentist.save({ validateBeforeSave: true });
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
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + validationErrors.join(', '),
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating dentist: ' + error.message
    });
  }
});

// @route   DELETE /api/dentists/:id
// @desc    Delete dentist
// @access  Private (Admin, Clinic only)
router.delete('/:id', authenticate, authorize(['Admin', 'Clinic']), async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.id);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found'
      });
    }

    // Check permissions for clinic users
    if (req.user.role === 'Clinic') {
      const clinic = await require('../models/Clinic').findOne({ userId: req.user._id });
      if (!clinic || dentist.clinicId.toString() !== clinic._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - can only delete your own clinic dentists'
        });
      }
    }

    // Delete the dentist
    await Dentist.findByIdAndDelete(req.params.id);

    // Optionally delete the associated user account
    if (dentist.userId) {
      await User.findByIdAndDelete(dentist.userId);
    }

    res.json({
      success: true,
      message: 'Dentist deleted successfully'
    });

  } catch (error) {
    console.error('Delete dentist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting dentist'
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