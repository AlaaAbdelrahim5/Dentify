const prisma = require('../../config/database');
const { hashPassword } = require('../../helpers/hash');
const { checkUserExists, normalizeGender } = require('../../helpers/validation');

/**
 * User Service
 * Consolidated user creation and management logic
 */

/**
 * Create a user with associated profile in a transaction
 * @param {Object} userData - User data (email, password, phone, role, status)
 * @param {Object} profileData - Profile-specific data
 * @param {string} modelName - Prisma model name for the profile (e.g., 'admin', 'dentist')
 * @param {Object} includeOptions - Additional include options for the response
 */
const createUserWithProfile = async (userData, profileData, modelName, includeOptions = {}) => {
  try {
    const { email, password, phone, role, status = 'ACTIVE' } = userData;

    // Check if user already exists
    if (await checkUserExists(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Normalize gender if present
    if (profileData.gender) {
      profileData.gender = normalizeGender(profileData.gender);
    }

    // Convert birthDate to Date object if present
    if (profileData.birthDate) {
      profileData.birthDate = new Date(profileData.birthDate);
    }

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone: phone || null,
          role,
          status
        }
      });

      // Default include options
      const defaultInclude = {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      };

      // Create profile
      const profile = await tx[modelName].create({
        data: {
          userId: user.id,
          ...profileData
        },
        include: { ...defaultInclude, ...includeOptions }
      });

      return profile;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user and profile data in a transaction
 * @param {number} userId - User ID
 * @param {Object} userUpdateData - Data to update in user table
 * @param {Object} profileUpdateData - Data to update in profile table
 * @param {string} modelName - Prisma model name for the profile
 * @param {Object} includeOptions - Include options for the response
 */
const updateUserWithProfile = async (userId, userUpdateData, profileUpdateData, modelName, includeOptions = {}) => {
  try {
    // Normalize gender if present
    if (profileUpdateData.gender) {
      profileUpdateData.gender = normalizeGender(profileUpdateData.gender);
    }

    // Convert birthDate to Date object if present
    if (profileUpdateData.birthDate) {
      profileUpdateData.birthDate = new Date(profileUpdateData.birthDate);
    }

    // Hash password if provided
    if (userUpdateData.password) {
      userUpdateData.password = await hashPassword(userUpdateData.password);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user data if provided
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData
        });
      }

      // Update profile data if provided
      if (Object.keys(profileUpdateData).length > 0) {
        await tx[modelName].update({
          where: { userId },
          data: profileUpdateData
        });
      }

      // Default include options
      const defaultInclude = {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      };

      // Fetch updated profile
      const updatedProfile = await tx[modelName].findUnique({
        where: { userId },
        include: { ...defaultInclude, ...includeOptions }
      });

      return updatedProfile;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Separate user fields from profile fields
 * @param {Object} data - Combined data object
 * @param {Array} userFields - List of user table fields
 */
const separateUserAndProfileData = (data, userFields = ['email', 'phone', 'password', 'profileImage']) => {
  const userData = {};
  const profileData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (userFields.includes(key)) {
        userData[key] = value;
      } else {
        profileData[key] = value;
      }
    }
  });

  return { userData, profileData };
};

module.exports = {
  createUserWithProfile,
  updateUserWithProfile,
  separateUserAndProfileData
};
