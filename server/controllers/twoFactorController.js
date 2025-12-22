const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const prisma = require('../utils/prisma');

// Enable 2FA - Generate secret and QR code
exports.enable2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true, email: true }
    });

    if (user.twoFactorEnabled) {
      return res.status(400).json({ 
        error: 'Two-factor authentication is already enabled' 
      });
    }

    // Generate a secret for the user
    const secret = speakeasy.generateSecret({
      name: `Dentify (${user.email})`,
      length: 32
    });

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily (not enabled until verified)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32
      }
    });

    res.json({
      message: 'Two-factor authentication secret generated. Please verify with your authenticator app.',
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ error: 'Failed to enable two-factor authentication' });
  }
};

// Verify and activate 2FA
exports.verify2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Get user's 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user.twoFactorSecret) {
      return res.status(400).json({ 
        error: 'Two-factor authentication has not been initialized. Please enable it first.' 
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 steps before/after for time sync issues
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true
      }
    });

    res.json({
      message: 'Two-factor authentication has been successfully enabled',
      twoFactorEnabled: true
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ error: 'Failed to verify two-factor authentication' });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, token } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get user with password
    const bcrypt = require('bcryptjs');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        password: true, 
        twoFactorSecret: true, 
        twoFactorEnabled: true 
      }
    });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ 
        error: 'Two-factor authentication is not enabled' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // If 2FA is enabled, verify the token as well
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
    }

    // Disable 2FA and remove secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    res.json({
      message: 'Two-factor authentication has been successfully disabled',
      twoFactorEnabled: false
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ error: 'Failed to disable two-factor authentication' });
  }
};

// Verify 2FA token during login
exports.verifyLogin2FA = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    // Find user with 2FA secret
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true,
        email: true,
        role: true,
        twoFactorSecret: true, 
        twoFactorEnabled: true 
      }
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Get full user data
    const { generateToken, generateRefreshToken } = require('../utils/jwt');
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
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

    // Generate tokens
    const accessToken = generateToken(fullUser.id, fullUser.role);
    const refreshToken = generateRefreshToken(fullUser.id);

    // Remove password from response
    delete fullUser.password;
    delete fullUser.twoFactorSecret;

    res.json({
      message: 'Login successful',
      user: fullUser,
      token: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    console.error('Verify login 2FA error:', error);
    res.status(500).json({ error: 'Failed to verify two-factor authentication' });
  }
};

// Get 2FA status
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    });

    res.json({
      twoFactorEnabled: user.twoFactorEnabled || false
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: 'Failed to get two-factor authentication status' });
  }
};
