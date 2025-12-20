const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

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
    const hashedPassword = await bcrypt.hash(password, 10);

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
    const isValidPassword = await bcrypt.compare(password, user.password);

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

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password from response
    delete user.password;

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
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

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
