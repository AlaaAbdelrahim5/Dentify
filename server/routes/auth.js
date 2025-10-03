const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Secretary = require('../models/Secretary');
const Clinic = require('../models/Clinic');
const RadiologyCenter = require('../models/RadiologyCenter');

const router = express.Router();

// Role model mapping
const roleModels = {
  Admin,
  Patient,
  Dentist,
  Secretary,
  Clinic,
  RadiologyCenter
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/login
// @desc    Unified login for all user types
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is suspended or deleted'
      });
    }

    // Get role-specific data
    let roleData = null;
    const RoleModel = roleModels[user.role];
    
    if (RoleModel) {
      roleData = await RoleModel.findOne({ userId: user._id })
        .populate('userId')
        .populate('clinicId', 'clinicName address contactInfo'); // For dentists and secretaries
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toPublicJSON(),
        profile: roleData,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Unified registration for all user types
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { userData, profileData, role } = req.body;

    // Validate required fields
    if (!userData || !userData.email || !userData.password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }

    // Validate role
    if (!roleModels[role]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user with role-specific profile
    const RoleModel = roleModels[role];
    const result = await RoleModel.createWithUser(userData, profileData);

    // Generate token
    const token = generateToken(result.user._id, result.user.role);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: result.user.toPublicJSON(),
        profile: result[role.toLowerCase()],
        role: result.user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or inactive user'
      });
    }

    // Get role-specific data
    let roleData = null;
    const RoleModel = roleModels[user.role];
    
    if (RoleModel) {
      roleData = await RoleModel.findOne({ userId: user._id })
        .populate('userId')
        .populate('clinicId', 'clinicName address contactInfo');
    }

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        profile: roleData,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or inactive user'
      });
    }

    const { userData, profileData } = req.body;

    // Update user data (email, phone, profileImage)
    if (userData) {
      const allowedUserFields = ['phone', 'profileImage'];
      allowedUserFields.forEach(field => {
        if (userData[field] !== undefined) {
          user[field] = userData[field];
        }
      });
      await user.save();
    }

    // Update role-specific data
    if (profileData) {
      const RoleModel = roleModels[user.role];
      if (RoleModel) {
        await RoleModel.findOneAndUpdate(
          { userId: user._id },
          { $set: profileData },
          { new: true, runValidators: true }
        );
      }
    }

    // Get updated profile
    const RoleModel = roleModels[user.role];
    let roleData = null;
    
    if (RoleModel) {
      roleData = await RoleModel.findOne({ userId: user._id })
        .populate('userId')
        .populate('clinicId', 'clinicName address contactInfo');
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicJSON(),
        profile: roleData,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

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
      message: 'Server error updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or inactive user'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

module.exports = router;