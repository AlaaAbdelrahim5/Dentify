// Authentication utility functions with JWT support
export const authUtils = {
  // Token storage keys
  ACCESS_TOKEN_KEY: 'dentify_access_token',
  REFRESH_TOKEN_KEY: 'dentify_refresh_token',
  USER_KEY: 'dentify_user',
  REMEMBER_KEY: 'dentify_remember',

  // Check if user is logged in with valid token
  isAuthenticated: async () => {
    const token = authUtils.getAccessToken();
    const user = authUtils.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    // For quick checks, assume token is valid if it exists
    // The API service will handle token refresh automatically
    return true;
  },

  // Validate token with server (optional method)
  validateToken: async () => {
    const token = authUtils.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      return data.success && data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Get access token from storage
  getAccessToken: () => {
    try {
      // Check localStorage first (remember me)
      let token = localStorage.getItem(authUtils.ACCESS_TOKEN_KEY);
      if (token) return token;

      // Check sessionStorage (session only)
      token = sessionStorage.getItem(authUtils.ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get refresh token from storage
  getRefreshToken: () => {
    try {
      // Check localStorage first (remember me)
      let token = localStorage.getItem(authUtils.REFRESH_TOKEN_KEY);
      if (token) return token;

      // Check sessionStorage (session only)
      token = sessionStorage.getItem(authUtils.REFRESH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

    // Check if remember me was selected
  shouldRemember: () => {
    return localStorage.getItem('rememberMe') === 'true';
  },

  // Set remember me preference
  setRememberMe: (remember) => {
    if (remember) {
      localStorage.setItem(authUtils.REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(authUtils.REMEMBER_KEY);
    }
  },
  setTokens: (tokens, remember = false) => {
    try {
      const storage = remember ? localStorage : sessionStorage;
      
      if (tokens.accessToken) {
        storage.setItem(authUtils.ACCESS_TOKEN_KEY, tokens.accessToken);
      }
      
      if (tokens.refreshToken) {
        storage.setItem(authUtils.REFRESH_TOKEN_KEY, tokens.refreshToken);
      }

      if (remember) {
        localStorage.setItem(authUtils.REMEMBER_KEY, 'true');
      }
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  },

  // Clear tokens from storage
  clearTokens: () => {
    try {
      localStorage.removeItem(authUtils.ACCESS_TOKEN_KEY);
      localStorage.removeItem(authUtils.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(authUtils.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(authUtils.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  // Get current user from storage
  getCurrentUser: () => {
    try {
      // Check localStorage first (remember me)
      let user = localStorage.getItem(authUtils.USER_KEY);
      if (user) {
        return JSON.parse(user);
      }

      // Check sessionStorage (session only)
      user = sessionStorage.getItem(authUtils.USER_KEY);
      if (user) {
        return JSON.parse(user);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Set user data in storage
  setUser: (user, remember = false) => {
    try {
      const userData = JSON.stringify(user);
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(authUtils.USER_KEY, userData);
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  // Clear user data from storage
  clearUser: () => {
    try {
      localStorage.removeItem(authUtils.USER_KEY);
      sessionStorage.removeItem(authUtils.USER_KEY);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  },

  // Login user with tokens
  login: (user, tokens, remember = false) => {
    authUtils.setRememberMe(remember);
    authUtils.setUser(user, remember);
    authUtils.setTokens(tokens, remember);
  },

  // Logout user
  logout: () => {
    try {
      authUtils.clearUser();
      authUtils.clearTokens();
      localStorage.removeItem(authUtils.REMEMBER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Check if tokens should be persisted
  shouldRemember: () => {
    return localStorage.getItem(authUtils.REMEMBER_KEY) === 'true';
  },

  // Initialize authentication state (call on app startup)
  initializeAuth: async () => {
    const token = authUtils.getAccessToken();
    const refreshToken = authUtils.getRefreshToken();
    const user = authUtils.getCurrentUser();

    if (!user) {
      authUtils.logout();
      return false;
    }

    if (!token) {
      if (refreshToken) {
        // Try to refresh the token
        try {
          const response = await fetch('http://localhost:5000/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
          });
          
          const data = await response.json();
          
          if (data.success) {
            const remember = authUtils.shouldRemember();
            authUtils.setTokens(data.tokens, remember);
            return true;
          } else {
            authUtils.logout();
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          authUtils.logout();
          return false;
        }
      } else {
        authUtils.logout();
        return false;
      }
    }

    return true;
  },

  // Get authorization header for API requests
  getAuthHeader: () => {
    const token = authUtils.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Get user's full name
  getUserName: () => {
    const user = authUtils.getCurrentUser();
    return user?.fullName || 'User';
  },

  // Get user's email
  getUserEmail: () => {
    const user = authUtils.getCurrentUser();
    return user?.email || '';
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authUtils.getCurrentUser();
    return user?.role === role;
  },

  // Get user's initials for avatar
  getUserInitials: () => {
    const user = authUtils.getCurrentUser();
    if (!user?.fullName) return 'U';
    
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName[0].toUpperCase();
  }
};

export default authUtils;