const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is suspended or deactivated'
      });
    }

    // Add user info to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Authorization middleware - checks user roles
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // If no specific roles required, allow any authenticated user
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(403).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail on errors
    next();
  }
};

/**
 * Role-specific authorization middlewares
 */
const adminOnly = authorize(['Admin']);
const clinicStaffOnly = authorize(['Dentist', 'Secretary', 'Clinic', 'Admin']);
const patientOrHigher = authorize(['Patient', 'Dentist', 'Secretary', 'Clinic', 'Admin']);
const healthcareProviderOnly = authorize(['Dentist', 'Clinic', 'RadiologyCenter', 'Admin']);

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  adminOnly,
  clinicStaffOnly,
  patientOrHigher,
  healthcareProviderOnly
};