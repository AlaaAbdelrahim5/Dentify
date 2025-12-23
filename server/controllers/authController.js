const { hashPassword, comparePassword } = require('../helpers/hash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken } = require('../services/auth/jwt');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../services/email/emailService');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, role, phone, firstName, lastName, gender, birthDate, city, ...additionalData } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ 
        error: 'Email, password, and role are required' 
      });
    }

    // Validate role-specific required fields
    if (role === 'Patient') {
      if (!firstName || !lastName || !birthDate || !city) {
        return res.status(400).json({
          error: 'First name, last name, birth date, and city are required for patients'
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with role-specific profile
    let user;
    
    if (role === 'Patient') {
      // Create user and patient profile in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
            phone,
            status: 'ACTIVE'
          }
        });

        const patient = await tx.patient.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName,
            gender: gender || null,
            birthDate: new Date(birthDate),
            city
          }
        });

        return { ...newUser, patient };
      });

      user = result;
    } else {
      // For other roles, create user only (handle profile creation separately)
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          phone,
          status: 'ACTIVE'
        }
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password from response
    delete user.password;

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        clinic: true,
        dentist: {
          include: {
            clinic: true
          }
        },
        secretary: {
          include: {
            clinic: true
          }
        },
        patient: true,
        radiology: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        error: 'Account is not active',
        status: user.status 
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Don't send tokens yet, require 2FA verification
      return res.json({
        message: 'Two-factor authentication required',
        requiresTwoFactor: true,
        email: user.email
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password and 2FA secret from response
    delete user.password;
    delete user.twoFactorSecret;

    res.json({
      message: 'Login successful',
      user,
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        admin: true,
        clinic: true,
        dentist: {
          include: {
            clinic: true
          }
        },
        secretary: {
          include: {
            clinic: true
          }
        },
        patient: true,
        radiology: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    delete user.password;

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newToken = generateToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Forgot password - Send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        dentist: true,
        secretary: true,
        admin: true
      }
    });

    // Always return success message (security best practice)
    // Don't reveal if email exists or not
    if (!user) {
      return res.json({ 
        message: 'If the email exists, a password reset link has been sent' 
      });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.json({ 
        message: 'If the email exists, a password reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(parseInt(process.env.RESET_TOKEN_BYTES_LENGTH)).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (default: 1 hour)
    const resetTokenExpiry = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY));

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry: resetTokenExpiry
      }
    });

    // Get user's first name for personalization
    let firstName = '';
    if (user.patient) firstName = user.patient.firstName;
    else if (user.dentist) firstName = user.dentist.firstName;
    else if (user.secretary) firstName = user.secretary.firstName;
    else if (user.admin) firstName = user.admin.name?.split(' ')[0];

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, firstName);

    res.json({ 
      message: 'If the email exists, a password reset link has been sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry: {
          gte: new Date() // Token not expired
        }
      },
      include: {
        patient: true,
        dentist: true,
        secretary: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    });

    // Get user's first name for confirmation email
    let firstName = '';
    if (user.patient) firstName = user.patient.firstName;
    else if (user.dentist) firstName = user.dentist.firstName;
    else if (user.secretary) firstName = user.secretary.firstName;
    else if (user.admin) firstName = user.admin.name?.split(' ')[0];

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, firstName);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

