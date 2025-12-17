import { storage } from './storage';

// Authentication utility functions with JWT support for React Native
export const authUtils = {
  // Token storage keys
  ACCESS_TOKEN_KEY: 'dentify_access_token',
  REFRESH_TOKEN_KEY: 'dentify_refresh_token',
  USER_KEY: 'dentify_user',
  REMEMBER_KEY: 'dentify_remember',
  LOGOUT_FLAG_KEY: 'dentify_logged_out',

  // Check if user is logged in with valid token
  isAuthenticated: async () => {
    const token = await authUtils.getAccessToken();
    const user = await authUtils.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    return true;
  },

  // Get access token from storage
  getAccessToken: async () => {
    try {
      const token = await storage.getItem(authUtils.ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get refresh token from storage
  getRefreshToken: async () => {
    try {
      const token = await storage.getItem(authUtils.REFRESH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Check if remember me was selected
  shouldRemember: async () => {
    const remember = await storage.getItem(authUtils.REMEMBER_KEY);
    return remember === 'true';
  },

  // Set remember me preference
  setRememberMe: async (remember) => {
    if (remember) {
      await storage.setItem(authUtils.REMEMBER_KEY, 'true');
    } else {
      await storage.removeItem(authUtils.REMEMBER_KEY);
    }
  },

  // Set tokens in storage
  setTokens: async (tokens, remember = false) => {
    try {
      console.log('Setting tokens:', { hasAccess: !!tokens.accessToken, hasRefresh: !!tokens.refreshToken, remember });
      
      if (tokens.accessToken) {
        await storage.setItem(authUtils.ACCESS_TOKEN_KEY, tokens.accessToken);
      }
      
      if (tokens.refreshToken) {
        await storage.setItem(authUtils.REFRESH_TOKEN_KEY, tokens.refreshToken);
      }

      if (remember) {
        await storage.setItem(authUtils.REMEMBER_KEY, 'true');
      } else {
        await storage.removeItem(authUtils.REMEMBER_KEY);
      }
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  },

  // Clear tokens from storage
  clearTokens: async () => {
    try {
      await storage.removeItem(authUtils.ACCESS_TOKEN_KEY);
      await storage.removeItem(authUtils.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  // Get current user from storage
  getCurrentUser: async () => {
    try {
      const user = await storage.getItem(authUtils.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Set user data in storage
  setUser: async (user, remember = false) => {
    try {
      const userData = JSON.stringify(user);
      await storage.setItem(authUtils.USER_KEY, userData);
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  // Update specific user fields
  updateUser: async (updates) => {
    try {
      const user = await authUtils.getCurrentUser();
      if (!user) return;
      
      const updatedUser = { ...user, ...updates };
      const remember = await authUtils.shouldRemember();
      await authUtils.setUser(updatedUser, remember);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  // Clear user data from storage
  clearUser: async () => {
    try {
      await storage.removeItem(authUtils.USER_KEY);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  },

  // Login user with tokens
  login: async (user, tokens, remember = false) => {
    console.log('Auth utils login called:', { user: user?.email, tokens: !!tokens, remember });
    await authUtils.setRememberMe(remember);
    await authUtils.setUser(user, remember);
    
    // Handle both response formats
    const tokenData = tokens.token ? {
      accessToken: tokens.token,
      refreshToken: tokens.refreshToken
    } : {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
    
    await authUtils.setTokens(tokenData, remember);
    await authUtils.clearLogoutFlag();
  },

  // Logout user
  logout: async () => {
    await authUtils.clearTokens();
    await authUtils.clearUser();
    await authUtils.setLogoutFlag();
  },

  // Set logout flag
  setLogoutFlag: async () => {
    await storage.setItem(authUtils.LOGOUT_FLAG_KEY, 'true');
  },

  // Clear logout flag
  clearLogoutFlag: async () => {
    await storage.removeItem(authUtils.LOGOUT_FLAG_KEY);
  },

  // Check if user was logged out
  wasLoggedOut: async () => {
    const flag = await storage.getItem(authUtils.LOGOUT_FLAG_KEY);
    return flag === 'true';
  },

  // Get auth header for API requests
  getAuthHeader: async () => {
    const token = await authUtils.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Check if user role is allowed on mobile (patient, dentist, secretary only)
  isRoleAllowed: (role) => {
    if (!role) return false;
    const allowedRoles = ['patient', 'dentist', 'secretary'];
    return allowedRoles.includes(role.toLowerCase());
  },

  // Get dashboard route based on user role
  getDashboardRoute: async () => {
    const user = await authUtils.getCurrentUser();
    if (!user || !user.role) return '/';

    // Mobile routes - all roles use the same dashboard entry point
    // which will render the appropriate overview based on role
    return '/dashboard';
  }
};
