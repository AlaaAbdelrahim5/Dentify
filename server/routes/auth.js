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

    console.log('🔐 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password valid:', isPasswordValid);
    
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

    console.log('📋 User role:', user.role);

    // Get role-specific data
    let roleData = null;
    const RoleModel = roleModels[user.role];
    
    if (RoleModel) {
      console.log('🔍 Fetching role-specific data for:', user.role);
      roleData = await RoleModel.findOne({ userId: user._id }).populate('userId');
      console.log('📊 Role data found:', roleData ? 'Yes' : 'No');
      
      // Only populate clinicId for roles that have it (Dentist, Secretary)
      if (user.role === 'Dentist' || user.role === 'Secretary') {
        console.log('🏥 Populating clinicId for:', user.role);
        roleData = await RoleModel.findOne({ userId: user._id })
          .populate('userId')
          .populate('clinicId', 'clinicName address contactInfo');
      }
    }

    // Generate tokens (access token and refresh token)
    const accessToken = generateToken(user._id, user.role);
    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role, type: 'refresh' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('🎫 Tokens generated');

    // Prepare user object with additional info
    const userResponse = user.toPublicJSON();
    // Add fullName from role-specific profile if available
    if (roleData && roleData.fullName) {
      userResponse.fullName = roleData.fullName;
    } else if (roleData && roleData.firstName && roleData.lastName) {
      userResponse.fullName = `${roleData.firstName} ${roleData.lastName}`;
    } else if (roleData && roleData.clinicName) {
      // For clinic users, use the clinic name
      userResponse.fullName = roleData.clinicName;
    } else if (roleData && roleData.centerName) {
      // For radiology center users, use the center name
      userResponse.fullName = roleData.centerName;
    }

    console.log('✅ Login successful for:', userResponse.email);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      },
      profile: roleData,
      role: user.role
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id, user.role);
    const newRefreshToken = jwt.sign(
      { userId: user._id, role: user.role, type: 'refresh' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify if a token is valid
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.json({
        success: true,
        valid: false,
        message: 'Invalid or expired token'
      });
    }

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.json({
        success: true,
        valid: false,
        message: 'User not found or inactive'
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Unified registration for all user types
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { userData, profileData, role } = req.body;

    console.log('📝 Registration attempt:', { userData: { ...userData, password: '***' }, profileData, role });

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
    console.error('❌ Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
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

// @route   GET /api/auth/me
// @desc    Get current user info from token
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Get role-specific data
    let roleData = null;
    const RoleModel = roleModels[user.role];
    
    if (RoleModel) {
      roleData = await RoleModel.findOne({ userId: user._id }).populate('userId');
      
      // Only populate clinicId for roles that have it (Dentist, Secretary)
      if (user.role === 'Dentist' || user.role === 'Secretary') {
        roleData = await RoleModel.findOne({ userId: user._id })
          .populate('userId')
          .populate('clinicId', 'clinicName address contactInfo');
      }
    }

    res.json({
      success: true,
      user: user.toPublicJSON(),
      profile: roleData,
      role: user.role
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user info'
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
      roleData = await RoleModel.findOne({ userId: user._id }).populate('userId');
      
      // Only populate clinicId for roles that have it (Dentist, Secretary)
      if (user.role === 'Dentist' || user.role === 'Secretary') {
        roleData = await RoleModel.findOne({ userId: user._id })
          .populate('userId')
          .populate('clinicId', 'clinicName address contactInfo');
      }
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
      roleData = await RoleModel.findOne({ userId: user._id }).populate('userId');
      
      // Only populate clinicId for roles that have it (Dentist, Secretary)
      if (user.role === 'Dentist' || user.role === 'Secretary') {
        roleData = await RoleModel.findOne({ userId: user._id })
          .populate('userId')
          .populate('clinicId', 'clinicName address contactInfo');
      }
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