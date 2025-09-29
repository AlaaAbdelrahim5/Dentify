// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API service for making HTTP requests
class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
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
  signup: (userData) => ApiService.post('/auth/signup', userData),
  login: (credentials) => ApiService.post('/auth/login', credentials),
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