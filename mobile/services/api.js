import { authUtils } from '../utils/auth';

// API configuration from environment variables
// Update the .env file to change the API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
  verify2FA: (data) => ApiService.post('/auth/login/verify-2fa', data),
  logout: () => ApiService.post('/auth/logout'),
  refresh: (refreshToken) => ApiService.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () => ApiService.get('/auth/me'),
  forgotPassword: (data) => ApiService.post('/auth/forgot-password', data),
  resetPassword: (data) => ApiService.post('/auth/reset-password', data),
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
  getStats: () => ApiService.get('/dentists/stats'),
  getAll: (paramsOrClinicId = null) => {
    let queryString = '';
    if (typeof paramsOrClinicId === 'string') {
      queryString = paramsOrClinicId ? `?${paramsOrClinicId}` : '';
    } else if (typeof paramsOrClinicId === 'number') {
      queryString = `?clinicId=${paramsOrClinicId}`;
    } else if (typeof paramsOrClinicId === 'object' && paramsOrClinicId !== null) {
      queryString = `?${new URLSearchParams(paramsOrClinicId).toString()}`;
    }
    return ApiService.get(`/dentists${queryString}`);
  },
  getForClinic: () => ApiService.get('/dentists/clinic'),
  getById: (id) => ApiService.get(`/dentists/${id}`),
  create: (dentistData) => ApiService.post('/dentists', dentistData),
  update: (id, dentistData) => ApiService.put(`/dentists/${id}`, dentistData),
  delete: (id) => ApiService.delete(`/dentists/${id}`),
  approve: (id) => ApiService.post(`/dentists/${id}/approve`),
  reject: (id, reason) => ApiService.post(`/dentists/${id}/reject`, { reason }),
  toggleStatus: (id) => ApiService.patch(`/dentists/${id}/toggle-status`),
  getMyProfile: () => ApiService.get('/dentists/me'),
  updateMyProfile: (data) => ApiService.put('/dentists/me', data),
  changePassword: (data) => ApiService.post('/auth/change-password', data),
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/dentists/search?${queryString}`);
  },
};

// Secretaries API functions
export const secretariesAPI = {
  getAll: (clinicId = null) => {
    const params = clinicId ? `?clinicId=${clinicId}` : '';
    return ApiService.get(`/secretaries${params}`);
  },
  getForClinic: () => ApiService.get('/secretaries/clinic'),
  getById: (id) => ApiService.get(`/secretaries/${id}`),
  create: (secretaryData) => ApiService.post('/secretaries', secretaryData),
  update: (id, secretaryData) => ApiService.put(`/secretaries/${id}`, secretaryData),
  delete: (id) => ApiService.delete(`/secretaries/${id}`),
  toggleStatus: (id) => ApiService.patch(`/secretaries/${id}/toggle-status`),
  getMyProfile: () => ApiService.get('/secretaries/me'),
  updateMyProfile: (data) => ApiService.put('/secretaries/me', data),
  changePassword: (data) => ApiService.post('/auth/change-password', data),
};

// Patients API functions
export const patientsAPI = {
  getStats: () => ApiService.get('/patients/stats'),
  getAll: () => ApiService.get('/patients'),
  getById: (id) => ApiService.get(`/patients/${id}`),
  create: (patientData) => ApiService.post('/patients', patientData),
  update: (id, patientData) => ApiService.put(`/patients/${id}`, patientData),
  delete: (id) => ApiService.delete(`/patients/${id}`),
  toggleStatus: (id) => ApiService.patch(`/patients/${id}/toggle-status`),
  getMyProfile: () => ApiService.get('/patients/me'),
  updateMyProfile: (data) => ApiService.put('/patients/me', data),
  changePassword: (data) => ApiService.post('/auth/change-password', data),
  getMyRadiologyRequests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/patients/my-radiology-requests${queryString ? `?${queryString}` : ''}`);
  },
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/patients/search?${queryString}`);
  },
};

// Clinics API functions
export const clinicsAPI = {
  getStats: () => ApiService.get('/clinics/stats'),
  getAll: () => ApiService.get('/clinics'),
  getById: (id) => ApiService.get(`/clinics/${id}`),
  create: (clinicData) => ApiService.post('/clinics', clinicData),
  update: (id, clinicData) => ApiService.put(`/clinics/${id}`, clinicData),
  delete: (id) => ApiService.delete(`/clinics/${id}`),
  toggleStatus: (id) => ApiService.patch(`/clinics/${id}/toggle-status`),
  getMyProfile: () => ApiService.get('/clinics/me'),
  updateMyProfile: (data) => ApiService.put('/clinics/me', data),
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/clinics/search?${queryString}`);
  },
  getAvailableTreatments: (id) => ApiService.get(`/clinics/${id}/available-treatments`),
  updateAvailableTreatments: (data) => ApiService.put('/clinics/me/available-treatments', data),
};

// Admin API functions
export const adminAPI = {
  getDashboardStats: () => ApiService.get('/admin/dashboard'),
  getAllUsers: () => ApiService.get('/admin/users'),
  getUserById: (id) => ApiService.get(`/admin/users/${id}`),
  updateUser: (id, userData) => ApiService.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => ApiService.delete(`/admin/users/${id}`),
  getPendingApprovals: () => ApiService.get('/admin/approvals/pending'),
  approveRequest: (id) => ApiService.post(`/admin/approvals/${id}/approve`),
  rejectRequest: (id) => ApiService.post(`/admin/approvals/${id}/reject`),
  getAdminStats: () => ApiService.get('/admins/stats'),
  getAllAdmins: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/admins?${queryString}`);
  },
  getAdminById: (id) => ApiService.get(`/admins/${id}`),
  createAdmin: (adminData) => ApiService.post('/admins', adminData),
  updateAdmin: (id, adminData) => ApiService.put(`/admins/${id}`, adminData),
  deleteAdmin: (id) => ApiService.delete(`/admins/${id}`),
  toggleStatus: (id) => ApiService.patch(`/admins/${id}/toggle-status`),
};

// Radiology API functions
export const radiologyAPI = {
  getStats: () => ApiService.get('/radiology/stats'),
  getAll: (queryParams = '') => {
    const query = queryParams ? `?${queryParams}` : '';
    return ApiService.get(`/radiology${query}`);
  },
  getById: (id) => ApiService.get(`/radiology/${id}`),
  create: (radiologyData) => ApiService.post('/radiology', radiologyData),
  update: (id, radiologyData) => ApiService.put(`/radiology/${id}`, radiologyData),
  delete: (id) => ApiService.delete(`/radiology/${id}`),
  toggleStatus: (id) => ApiService.patch(`/radiology-centers/${id}/toggle-status`),
  getMyProfile: () => ApiService.get('/radiology/me'),
  updateMyProfile: (data) => ApiService.put('/radiology/me', data),
};

// Health check API
export const healthAPI = {
  check: () => ApiService.get('/health'),
};

// Appointments API functions
export const appointmentsAPI = {
  getMyAppointments: () => ApiService.get('/appointments/patient/my-appointments'),
  getDentistAppointments: () => ApiService.get('/appointments/dentist/my-appointments'),
  getClinicAppointments: () => ApiService.get('/appointments/clinic/my-appointments'),
  getAll: () => ApiService.get('/appointments'),
  getById: (id) => ApiService.get(`/appointments/${id}`),
  create: (appointmentData) => ApiService.post('/appointments', appointmentData),
  update: (id, appointmentData) => ApiService.put(`/appointments/${id}`, appointmentData),
  cancel: (id) => ApiService.patch(`/appointments/${id}/cancel`),
  complete: (id, data = {}) => ApiService.patch(`/appointments/${id}/complete`, data),
  delete: (id) => ApiService.delete(`/appointments/${id}`),
  getAvailableSlots: (dentistId, date) => 
    ApiService.get(`/appointments/dentist/${dentistId}/available-slots?date=${date}`),
  getDentistsByClinic: (clinicId) => 
    ApiService.get(`/appointments/clinics/${clinicId}/dentists`),
};

// Treatments API functions
export const treatmentsAPI = {
  getStats: () => ApiService.get('/treatments/stats'),
  getDentistTreatments: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/treatments/dentist/my-treatments${params}`);
  },
  getPatientTreatments: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/treatments/patient/my-treatments${params}`);
  },
  getClinicTreatments: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/treatments/clinic/my-treatments${params}`);
  },
  getAll: () => ApiService.get('/treatments'),
  getById: (id) => ApiService.get(`/treatments/${id}`),
  create: (treatmentData) => ApiService.post('/treatments', treatmentData),
  update: (id, treatmentData) => ApiService.put(`/treatments/${id}`, treatmentData),
  delete: (id) => ApiService.delete(`/treatments/${id}`),
  getPrescriptions: (treatmentId) => ApiService.get(`/treatments/${treatmentId}/prescriptions`),
  createPrescription: (treatmentId, prescriptionData) => 
    ApiService.post(`/treatments/${treatmentId}/prescriptions`, prescriptionData),
  deletePrescription: (treatmentId, prescriptionId) => 
    ApiService.delete(`/treatments/${treatmentId}/prescriptions/${prescriptionId}`),
};

// Payments API functions
export const paymentsAPI = {
  getStats: () => ApiService.get('/payments/stats'),
  getDentistPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/payments/dentist/my-payments${queryString ? `?${queryString}` : ''}`);
  },
  getPatientPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/payments/patient/my-payments${queryString ? `?${queryString}` : ''}`);
  },
  getClinicPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/payments/clinic/my-payments${queryString ? `?${queryString}` : ''}`);
  },
  getByTreatment: (treatmentId) => ApiService.get(`/payments/treatment/${treatmentId}`),
  getById: (id) => ApiService.get(`/payments/${id}`),
  create: (paymentData) => ApiService.post('/payments', paymentData),
  update: (id, paymentData) => ApiService.put(`/payments/${id}`, paymentData),
  delete: (id) => ApiService.delete(`/payments/${id}`),
};

// Radiology Requests API functions
export const radiologyRequestsAPI = {
  getStats: () => ApiService.get('/radiology-requests/stats'),
  getDentistRequests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/radiology-requests/dentist/my-requests${queryString ? `?${queryString}` : ''}`);
  },
  getCenterRequests: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/radiology-requests/center/my-requests${params}`);
  },
  getAll: () => ApiService.get('/radiology-requests'),
  getById: (id) => ApiService.get(`/radiology-requests/${id}`),
  create: (requestData) => ApiService.post('/radiology-requests', requestData),
  updateStatus: (id, statusData) => ApiService.patch(`/radiology-requests/${id}/status`, statusData),
  update: (id, requestData) => ApiService.put(`/radiology-requests/${id}`, requestData),
  delete: (id) => ApiService.delete(`/radiology-requests/${id}`),
};

// Upload API functions for profile images
export const uploadAPI = {
  uploadProfileImage: async (formData) => {
    const authHeaders = await authUtils.getAuthHeader();
    const url = `${API_BASE_URL}/upload/profile-image`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }

    return data;
  },
  deleteProfileImage: async () => {
    const authHeaders = await authUtils.getAuthHeader();
    const url = `${API_BASE_URL}/upload/profile-image`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete image');
    }

    return data;
  },
};

export default ApiService;
