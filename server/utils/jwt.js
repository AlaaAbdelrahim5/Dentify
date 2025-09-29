const jwt = require('jsonwebtoken');

// JWT secret - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'dentify_super_secret_key_2025';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

/**
 * Generate JWT access token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'dentify-app',
    audience: 'dentify-users'
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'dentify-app',
    audience: 'dentify-users'
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'dentify-app',
      audience: 'dentify-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate tokens for user
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    fullName: user.fullName
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRE
  };
};

/**
 * Extract token from authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokens,
  extractTokenFromHeader,
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_REFRESH_EXPIRE
};