import { authUtils } from '../utils/auth';

// API configuration from environment variables
// Update the .env file to change the API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.15:5000/api';

console.log('📡 API Base URL:', API_BASE_URL);

// API service for making HTTP requests with JWT support
class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth headers
    const authHeaders = await authUtils.getAuthHeader();
    
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
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        // Try to refresh token if we have a refresh token
        const refreshToken = await authUtils.getRefreshToken();
        if (refreshToken && !endpoint.includes('/auth/refresh')) {
          try {
            const refreshResponse = await this.refreshAccessToken();
            if (refreshResponse.success) {
              // Retry original request with new token
              const newAuthHeaders = await authUtils.getAuthHeader();
              config.headers = {
                ...config.headers,
                ...newAuthHeaders,
              };
              return this.request(endpoint, { ...options, headers: config.headers });
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            await authUtils.logout();
            throw new Error('Session expired. Please login again.');
          }
        } else {
          await authUtils.logout();
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
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error) {
      // Silent error handling - errors will be displayed in UI, not console
      if (!error.response && error.message.includes('HTTP error')) {
        error.response = { data: { message: error.message }, status: 400 };
      }
      throw error;
    }
  }

  static async refreshAccessToken() {
    const refreshToken = await authUtils.getRefreshToken();
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
      throw new Error(data.error || 'Token refresh failed');
    }

    const remember = await authUtils.shouldRemember();
    await authUtils.setTokens({
      accessToken: data.token,
      refreshToken: data.refreshToken
    }, remember);

    return { success: true, tokens: { accessToken: data.token, refreshToken: data.refreshToken } };
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

  static async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
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
  register: (userData) => ApiService.post('/auth/register', userData),
  signup: (userData) => ApiService.post('/auth/register', userData),
  login: (credentials) => ApiService.post('/auth/login', credentials),
  logout: () => ApiService.post('/auth/logout'),
  refresh: (refreshToken) => ApiService.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () => ApiService.get('/auth/me'),
};

export default ApiService;
