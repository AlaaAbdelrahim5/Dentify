const express = require('express');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admins
// @desc    Create new admin (Admin only)
// @access  Private (Admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create admin with user using the static method
    const { user, admin } = await Admin.createWithUser(
      { email, password, phone },
      { firstName, lastName, gender }
    );

    // Get the created admin with populated user data
    const populatedAdmin = await Admin.findById(admin._id)
      .populate('userId', '-password');

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: populatedAdmin
    });

  } catch (error) {
    console.error('Create admin error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating admin'
    });
  }
});

// @route   GET /api/admins
// @desc    Get all admins (Admin only)
// @access  Private (Admin only)
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('userId', '-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admins,
      count: admins.length
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching admins'
    });
  }
});

// @route   GET /api/admins/:id
// @desc    Get admin by ID (Admin only)
// @access  Private (Admin only)
router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate('userId', '-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching admin'
    });
  }
});

// @route   PUT /api/admins/:id
// @desc    Update admin (Admin only)
// @access  Private (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { userData, adminData } = req.body;

    // Find admin
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
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
        await User.findByIdAndUpdate(admin.userId, userUpdateData, {
          new: true,
          runValidators: true
        });
      }
    }

    // Update admin data if provided
    if (adminData) {
      const allowedAdminFields = ['firstName', 'lastName', 'gender'];
      const adminUpdateData = {};
      
      allowedAdminFields.forEach(field => {
        if (adminData[field] !== undefined) {
          adminUpdateData[field] = adminData[field];
        }
      });

      if (Object.keys(adminUpdateData).length > 0) {
        Object.assign(admin, adminUpdateData);
        await admin.save();
      }
    }

    // Get updated admin
    const updatedAdmin = await Admin.findById(admin._id)
      .populate('userId', '-password');

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin
    });

  } catch (error) {
    console.error('Update admin error:', error);
    
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
      message: 'Server error updating admin'
    });
  }
});

// @route   DELETE /api/admins/:id
// @desc    Delete admin (Admin only)
// @access  Private (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent admin from deleting themselves
    if (admin.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    // Soft delete by updating user status
    await User.findByIdAndUpdate(admin.userId, { status: 'deleted' });

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting admin'
    });
  }
});

// @route   GET /api/admins/stats/overview
// @desc    Get admin statistics overview
// @access  Private (Admin only)
router.get('/stats/overview', authenticate, adminOnly, async (req, res) => {
  try {
    const stats = await Promise.all([
      Admin.countDocuments(),
      User.countDocuments({ role: 'Patient', status: 'active' }),
      User.countDocuments({ role: 'Dentist', status: 'active' }),
      User.countDocuments({ role: 'Clinic', status: 'active' }),
      User.countDocuments({ role: 'RadiologyCenter', status: 'active' }),
      User.countDocuments({ role: 'Secretary', status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        totalAdmins: stats[0],
        totalPatients: stats[1],
        totalDentists: stats[2],
        totalClinics: stats[3],
        totalRadiologyCenters: stats[4],
        totalSecretaries: stats[5],
        totalUsers: stats.slice(0, 6).reduce((sum, count) => sum + count, 0)
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

module.exports = router;