// Authentication utility functions
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    const user = authUtils.getCurrentUser();
    return !!user;
  },

  // Get current user from storage
  getCurrentUser: () => {
    try {
      // Check localStorage first (remember me)
      let user = localStorage.getItem('dentify_user');
      if (user) {
        return JSON.parse(user);
      }

      // Check sessionStorage (session only)
      user = sessionStorage.getItem('dentify_user');
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
      if (remember) {
        localStorage.setItem('dentify_user', userData);
        localStorage.setItem('dentify_remember', 'true');
      } else {
        sessionStorage.setItem('dentify_user', userData);
      }
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  // Logout user
  logout: () => {
    try {
      localStorage.removeItem('dentify_user');
      localStorage.removeItem('dentify_remember');
      sessionStorage.removeItem('dentify_user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
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