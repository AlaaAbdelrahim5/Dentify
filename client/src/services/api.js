import { authUtils } from '../utils/auth';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API service for making HTTP requests with JWT support
class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth headers
    const authHeaders = authUtils.getAuthHeader();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 responses (token expired/invalid)
      if (response.status === 401) {
        // Try to refresh token if we have a refresh token
        const refreshToken = authUtils.getRefreshToken();
        if (refreshToken && !endpoint.includes('/auth/refresh')) {
          try {
            const refreshResponse = await this.refreshAccessToken();
            if (refreshResponse.success) {
              // Retry original request with new token
              const newAuthHeaders = authUtils.getAuthHeader();
              config.headers = {
                ...config.headers,
                ...newAuthHeaders,
              };
              return this.request(endpoint, { ...options, headers: config.headers });
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            authUtils.logout();
            // Optionally redirect to login
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          }
        } else {
          authUtils.logout();
          // Optionally redirect to login
          window.location.href = '/login';
          throw new Error('Authentication required. Please login.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async refreshAccessToken() {
    const refreshToken = authUtils.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    // Store new tokens
    const remember = authUtils.shouldRemember();
    authUtils.setTokens(data.tokens, remember);

    return data;
  }

  static async get(endpoint) {
    return this.request(endpoint);
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Auth API functions
export const authAPI = {
  signup: (userData) => ApiService.post('/auth/register', userData),
  login: (credentials) => ApiService.post('/auth/login', credentials),
  logout: () => ApiService.post('/auth/logout'),
  refresh: (refreshToken) => ApiService.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () => ApiService.get('/auth/me'),
  verifyToken: (token) => ApiService.post('/auth/verify', { token }),
  checkEmail: (email) => ApiService.post('/auth/check-email', { email }),
};

// User API functions
export const userAPI = {
  getAll: () => ApiService.get('/users'),
  getById: (id) => ApiService.get(`/users/${id}`),
  update: (id, data) => ApiService.put(`/users/${id}`, data),
  delete: (id) => ApiService.delete(`/users/${id}`),
};

// Health check API
export const healthAPI = {
  check: () => ApiService.get('/health'),
  databaseStatus: () => ApiService.get('/database/status'),
};

export default ApiService;