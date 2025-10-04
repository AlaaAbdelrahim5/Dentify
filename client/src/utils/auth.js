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
      if (token) {
        console.log('Access token found in localStorage');
        return token;
      }

      // Check sessionStorage (session only)
      token = sessionStorage.getItem(authUtils.ACCESS_TOKEN_KEY);
      if (token) {
        console.log('Access token found in sessionStorage');
        return token;
      }
      
      console.log('No access token found');
      return null;
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
      console.log('Setting tokens:', { hasAccess: !!tokens.accessToken, hasRefresh: !!tokens.refreshToken, remember });
      const storage = remember ? localStorage : sessionStorage;
      
      if (tokens.accessToken) {
        storage.setItem(authUtils.ACCESS_TOKEN_KEY, tokens.accessToken);
        console.log('Access token stored in:', remember ? 'localStorage' : 'sessionStorage');
      }
      
      if (tokens.refreshToken) {
        storage.setItem(authUtils.REFRESH_TOKEN_KEY, tokens.refreshToken);
        console.log('Refresh token stored in:', remember ? 'localStorage' : 'sessionStorage');
      }

      if (remember) {
        localStorage.setItem(authUtils.REMEMBER_KEY, 'true');
        console.log('Remember preference saved');
      } else {
        localStorage.removeItem(authUtils.REMEMBER_KEY);
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
    console.log('Auth utils login called:', { user: user?.email, tokens: !!tokens, remember });
    authUtils.setRememberMe(remember);
    authUtils.setUser(user, remember);
    authUtils.setTokens(tokens, remember);
    console.log('Login complete, tokens stored in:', remember ? 'localStorage' : 'sessionStorage');
  },

  // Logout user
  logout: () => {
    try {
      console.log('Logging out user...');
      authUtils.clearUser();
      authUtils.clearTokens();
      localStorage.removeItem(authUtils.REMEMBER_KEY);
      // Clear any authentication flags
      localStorage.removeItem('dentify_logout_performed');
      sessionStorage.removeItem('dentify_logout_performed');
      // Set a flag to indicate logout was performed
      localStorage.setItem('dentify_logout_performed', 'true');
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Check if logout was just performed (without consuming the flag)
  wasLoggedOut: () => {
    return localStorage.getItem('dentify_logout_performed') === 'true';
  },

  // Clear the logout flag
  clearLogoutFlag: () => {
    localStorage.removeItem('dentify_logout_performed');
  },

  // Check if tokens should be persisted
  shouldRemember: () => {
    return localStorage.getItem(authUtils.REMEMBER_KEY) === 'true';
  },

  // Initialize authentication state (call on app startup)
  initializeAuth: async () => {
    console.log('Initializing auth...');
    
    // Check if user just logged out - this should always be the first check
    if (authUtils.wasLoggedOut()) {
      console.log('Auth: User just logged out, clearing any remaining auth data and skipping auth check');
      // Make sure everything is cleaned up
      authUtils.clearUser();
      authUtils.clearTokens();
      localStorage.removeItem(authUtils.REMEMBER_KEY);
      return false;
    }
    
    const token = authUtils.getAccessToken();
    const refreshToken = authUtils.getRefreshToken();
    const user = authUtils.getCurrentUser();
    const shouldRemember = authUtils.shouldRemember();
    
    console.log('Auth state check:', { 
      hasToken: !!token, 
      hasRefreshToken: !!refreshToken, 
      hasUser: !!user, 
      shouldRemember 
    });

    if (!user) {
      console.log('No user found, logging out');
      authUtils.logout();
      return false;
    }

    if (!token) {
      if (refreshToken) {
        console.log('No access token, trying to refresh...');
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
            console.log('Token refresh successful');
            const remember = authUtils.shouldRemember();
            authUtils.setTokens(data.tokens, remember);
            return true;
          } else {
            console.log('Token refresh failed:', data.message);
            authUtils.logout();
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          authUtils.logout();
          return false;
        }
      } else {
        console.log('No refresh token available, logging out');
        authUtils.logout();
        return false;
      }
    }

    console.log('Auth initialization successful');
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
    if (user?.fullName) {
      return user.fullName;
    }
    
    // Fallback to email prefix for user-friendly display
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      // Convert email prefix to more readable format
      return emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'User';
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
    let name = user?.fullName;
    
    // If no fullName, try to use email prefix
    if (!name && user?.email) {
      name = user.email.split('@')[0];
    }
    
    if (!name) return 'U';
    
    // Handle multi-word names (e.g., "Smile Dental Center" -> "SD")
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    
    // Single word or fallback
    return name[0].toUpperCase();
  },

  // Get dashboard route based on user role
  getDashboardRoute: () => {
    const user = authUtils.getCurrentUser();
    if (!user || !user.role) return '/dashboard';
    
    switch (user.role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Patient':
        return '/patient/dashboard';
      case 'Clinic':
        return '/clinic/dashboard';
      case 'Dentist':
        return '/dentist/dashboard'; // For future implementation
      case 'Secretary':
        return '/secretary/dashboard'; // For future implementation
      default:
        return '/dashboard';
    }
  }
};

export default authUtils;