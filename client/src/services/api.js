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

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
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

// Dentists API functions
export const dentistsAPI = {
  // Get all dentists for the clinic
  getAll: (clinicId = null) => {
    const params = clinicId ? `?clinicId=${clinicId}` : '';
    return ApiService.get(`/dentists${params}`);
  },
  
  // Get dentist by ID
  getById: (id) => ApiService.get(`/dentists/${id}`),
  
  // Create new dentist (send request to admin)
  create: (dentistData) => ApiService.post('/dentists', dentistData),
  
  // Update dentist
  update: (id, dentistData) => ApiService.put(`/dentists/${id}`, dentistData),
  
  // Delete dentist
  delete: (id) => ApiService.delete(`/dentists/${id}`),
  
  // Get current dentist profile (for dentist users)
  getMyProfile: () => ApiService.get('/dentists/me'),
  
  // Update current dentist profile
  updateMyProfile: (data) => ApiService.put('/dentists/me', data),
  
  // Search dentists with filters
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/dentists/search?${queryString}`);
  },
};

// Secretaries API functions
export const secretariesAPI = {
  // Get all secretaries for the clinic
  getAll: (clinicId = null) => {
    const params = clinicId ? `?clinicId=${clinicId}` : '';
    return ApiService.get(`/secretaries${params}`);
  },
  
  // Get secretary by ID
  getById: (id) => ApiService.get(`/secretaries/${id}`),
  
  // Create new secretary
  create: (secretaryData) => ApiService.post('/secretaries', secretaryData),
  
  // Update secretary
  update: (id, secretaryData) => ApiService.put(`/secretaries/${id}`, secretaryData),
  
  // Delete secretary
  delete: (id) => ApiService.delete(`/secretaries/${id}`),
  
  // Get current secretary profile (for secretary users)
  getMyProfile: () => ApiService.get('/secretaries/me'),
  
  // Update current secretary profile
  updateMyProfile: (data) => ApiService.put('/secretaries/me', data),
};

// Health check API
export const healthAPI = {
  check: () => ApiService.get('/health'),
  databaseStatus: () => ApiService.get('/database/status'),
};

export default ApiService;