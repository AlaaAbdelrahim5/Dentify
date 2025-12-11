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
      // Skip redirect for login/register endpoints - let the page handle the error
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
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
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // If error doesn't have response property, add it
      if (!error.response && error.message.includes('HTTP error')) {
        error.response = { data: { message: error.message }, status: 400 };
      }
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
      throw new Error(data.error || 'Token refresh failed');
    }

    // Backend returns { token, refreshToken } directly, not nested in tokens object
    const remember = authUtils.shouldRemember();
    authUtils.setTokens({
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
  signup: (userData) => ApiService.post('/auth/register', userData), // Alias for consistency
  login: (credentials) => ApiService.post('/auth/login', credentials),
  logout: () => ApiService.post('/auth/logout'),
  refresh: (refreshToken) => ApiService.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () => ApiService.get('/auth/me'),
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
  // Get dentists statistics
  getStats: () => ApiService.get('/dentists/stats'),
  
  // Get all dentists with optional query parameters
  getAll: (paramsOrClinicId = null) => {
    // Support both old API (clinicId number) and new API (query string)
    let queryString = '';
    if (typeof paramsOrClinicId === 'string') {
      // New API: query string passed directly
      queryString = paramsOrClinicId ? `?${paramsOrClinicId}` : '';
    } else if (typeof paramsOrClinicId === 'number') {
      // Old API: clinicId number
      queryString = `?clinicId=${paramsOrClinicId}`;
    } else if (typeof paramsOrClinicId === 'object' && paramsOrClinicId !== null) {
      // Object with params
      queryString = `?${new URLSearchParams(paramsOrClinicId).toString()}`;
    }
    return ApiService.get(`/dentists${queryString}`);
  },
  
  // Get all dentists for the authenticated clinic
  getForClinic: () => ApiService.get('/dentists/clinic'),
  
  // Get dentist by ID
  getById: (id) => ApiService.get(`/dentists/${id}`),
  
  // Create new dentist (send request to admin)
  create: (dentistData) => ApiService.post('/dentists', dentistData),
  
  // Update dentist
  update: (id, dentistData) => ApiService.put(`/dentists/${id}`, dentistData),
  
  // Delete dentist
  delete: (id) => ApiService.delete(`/dentists/${id}`),
  
  // Approve dentist (Admin only)
  approve: (id) => ApiService.post(`/dentists/${id}/approve`),
  
  // Reject dentist (Admin only)
  reject: (id, reason) => ApiService.post(`/dentists/${id}/reject`, { reason }),
  
  // Toggle dentist status (Admin and Clinic)
  toggleStatus: (id) => ApiService.patch(`/dentists/${id}/toggle-status`),
  
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
  
  // Get all secretaries for the authenticated clinic
  getForClinic: () => ApiService.get('/secretaries/clinic'),
  
  // Get secretary by ID
  getById: (id) => ApiService.get(`/secretaries/${id}`),
  
  // Create new secretary
  create: (secretaryData) => ApiService.post('/secretaries', secretaryData),
  
  // Update secretary
  update: (id, secretaryData) => ApiService.put(`/secretaries/${id}`, secretaryData),
  
  // Delete secretary
  delete: (id) => ApiService.delete(`/secretaries/${id}`),
  
  // Toggle secretary status (activate/deactivate)
  toggleStatus: (id) => ApiService.patch(`/secretaries/${id}/toggle-status`),
  
  // Get current secretary profile (for secretary users)
  getMyProfile: () => ApiService.get('/secretaries/me'),
  
  // Update current secretary profile (for secretary users)
  updateMyProfile: (data) => ApiService.put('/secretaries/me', data),
};

// Patients API functions
export const patientsAPI = {
  // Get patients statistics
  getStats: () => ApiService.get('/patients/stats'),
  
  // Get all patients
  getAll: () => ApiService.get('/patients'),
  
  // Get patient by ID
  getById: (id) => ApiService.get(`/patients/${id}`),
  
  // Create new patient
  create: (patientData) => ApiService.post('/patients', patientData),
  
  // Update patient
  update: (id, patientData) => ApiService.put(`/patients/${id}`, patientData),
  
  // Delete patient
  delete: (id) => ApiService.delete(`/patients/${id}`),
  
  // Toggle patient status (activate/deactivate)
  toggleStatus: (id) => ApiService.patch(`/patients/${id}/toggle-status`),
  
  // Get current patient profile (for patient users)
  getMyProfile: () => ApiService.get('/patients/me'),
  
  // Update current patient profile
  updateMyProfile: (data) => ApiService.put('/patients/me', data),
  
  // Get current patient's radiology requests
  getMyRadiologyRequests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/patients/my-radiology-requests${queryString ? `?${queryString}` : ''}`);
  },
  
  // Search patients
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/patients/search?${queryString}`);
  },
};

// Clinics API functions
export const clinicsAPI = {
  // Get clinics statistics
  getStats: () => ApiService.get('/clinics/stats'),
  
  // Get all clinics
  getAll: () => ApiService.get('/clinics'),
  
  // Get clinic by ID
  getById: (id) => ApiService.get(`/clinics/${id}`),
  
  // Create new clinic
  create: (clinicData) => ApiService.post('/clinics', clinicData),
  
  // Update clinic
  update: (id, clinicData) => ApiService.put(`/clinics/${id}`, clinicData),
  
  // Delete clinic
  delete: (id) => ApiService.delete(`/clinics/${id}`),
  
  // Toggle clinic status (activate/deactivate)
  toggleStatus: (id) => ApiService.patch(`/clinics/${id}/toggle-status`),
  
  // Get current clinic profile (for clinic users)
  getMyProfile: () => ApiService.get('/clinics/me'),
  
  // Update current clinic profile
  updateMyProfile: (data) => ApiService.put('/clinics/me', data),
  
  // Search clinics
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/clinics/search?${queryString}`);
  },
};

// Admin API functions
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => ApiService.get('/admin/dashboard'),
  
  // User management
  getAllUsers: () => ApiService.get('/admin/users'),
  getUserById: (id) => ApiService.get(`/admin/users/${id}`),
  updateUser: (id, userData) => ApiService.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => ApiService.delete(`/admin/users/${id}`),
  
  // Approval management
  getPendingApprovals: () => ApiService.get('/admin/approvals/pending'),
  approveRequest: (id) => ApiService.post(`/admin/approvals/${id}/approve`),
  rejectRequest: (id) => ApiService.post(`/admin/approvals/${id}/reject`),
  
  // Admin Management
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
  // Get radiology centers statistics
  getStats: () => ApiService.get('/radiology/stats'),
  
  // Get all radiology centers
  getAll: (queryParams = '') => {
    const query = queryParams ? `?${queryParams}` : '';
    return ApiService.get(`/radiology${query}`);
  },
  
  // Get radiology center by ID
  getById: (id) => ApiService.get(`/radiology/${id}`),
  
  // Create new radiology center
  create: (radiologyData) => ApiService.post('/radiology', radiologyData),
  
  // Update radiology center
  update: (id, radiologyData) => ApiService.put(`/radiology/${id}`, radiologyData),
  
  // Delete radiology center
  delete: (id) => ApiService.delete(`/radiology/${id}`),
  
  // Toggle radiology center status (activate/deactivate)
  toggleStatus: (id) => ApiService.patch(`/radiology-centers/${id}/toggle-status`),
  
  // Get current radiology profile (for radiology users)
  getMyProfile: () => ApiService.get('/radiology/me'),
  
  // Update current radiology profile
  updateMyProfile: (data) => ApiService.put('/radiology/me', data),
};

// Health check API
export const healthAPI = {
  check: () => ApiService.get('/health'),
};

// Appointments API functions
export const appointmentsAPI = {
  // Get patient's appointments
  getMyAppointments: () => ApiService.get('/appointments/patient/my-appointments'),
  
  // Get dentist's appointments
  getDentistAppointments: () => ApiService.get('/appointments/dentist/my-appointments'),
  
  // Get clinic's appointments
  getClinicAppointments: () => ApiService.get('/appointments/clinic/my-appointments'),
  
  // Get all appointments (Admin only)
  getAll: () => ApiService.get('/appointments'),
  
  // Get appointment by ID
  getById: (id) => ApiService.get(`/appointments/${id}`),
  
  // Create new appointment
  create: (appointmentData) => ApiService.post('/appointments', appointmentData),
  
  // Update appointment
  update: (id, appointmentData) => ApiService.put(`/appointments/${id}`, appointmentData),
  
  // Cancel appointment
  cancel: (id) => ApiService.patch(`/appointments/${id}/cancel`),
  
  // Complete appointment (Dentist only)
  complete: (id, data = {}) => ApiService.patch(`/appointments/${id}/complete`, data),
  
  // Delete appointment (Admin/Clinic only)
  delete: (id) => ApiService.delete(`/appointments/${id}`),
  
  // Get available time slots for a dentist on a specific date
  getAvailableSlots: (dentistId, date) => 
    ApiService.get(`/appointments/dentist/${dentistId}/available-slots?date=${date}`),
  
  // Get dentists by clinic
  getDentistsByClinic: (clinicId) => 
    ApiService.get(`/appointments/clinics/${clinicId}/dentists`),
};

// Treatments API functions
export const treatmentsAPI = {
  // Get treatment statistics for dentist
  getStats: () => ApiService.get('/treatments/stats'),
  
  // Get dentist's treatments
  getDentistTreatments: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/treatments/dentist/my-treatments${params}`);
  },
  
  // Get patient's treatments
  getPatientTreatments: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/treatments/patient/my-treatments${params}`);
  },
  
  // Get clinic's treatments (Secretary access)
  getClinicTreatments: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/treatments/clinic/my-treatments${params}`);
  },
  
  // Get all treatments (Admin/Clinic only)
  getAll: () => ApiService.get('/treatments'),
  
  // Get treatment by ID
  getById: (id) => ApiService.get(`/treatments/${id}`),
  
  // Create new treatment
  create: (treatmentData) => ApiService.post('/treatments', treatmentData),
  
  // Update treatment
  update: (id, treatmentData) => ApiService.put(`/treatments/${id}`, treatmentData),
  
  // Delete treatment
  delete: (id) => ApiService.delete(`/treatments/${id}`),
  
  // Get prescriptions for a treatment
  getPrescriptions: (treatmentId) => ApiService.get(`/treatments/${treatmentId}/prescriptions`),
  
  // Create prescription for a treatment
  createPrescription: (treatmentId, prescriptionData) => 
    ApiService.post(`/treatments/${treatmentId}/prescriptions`, prescriptionData),
  
  // Delete prescription from a treatment
  deletePrescription: (treatmentId, prescriptionId) => 
    ApiService.delete(`/treatments/${treatmentId}/prescriptions/${prescriptionId}`),
};

// Payments API functions
export const paymentsAPI = {
  // Get payment statistics for dentist
  getStats: () => ApiService.get('/payments/stats'),
  
  // Get dentist's payments
  getDentistPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/payments/dentist/my-payments${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get patient's payments
  getPatientPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/payments/patient/my-payments${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get clinic's payments (Secretary access)
  getClinicPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/payments/clinic/my-payments${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get payments for a specific treatment
  getByTreatment: (treatmentId) => ApiService.get(`/payments/treatment/${treatmentId}`),
  
  // Get payment by ID
  getById: (id) => ApiService.get(`/payments/${id}`),
  
  // Create new payment
  create: (paymentData) => ApiService.post('/payments', paymentData),
  
  // Update payment
  update: (id, paymentData) => ApiService.put(`/payments/${id}`, paymentData),
  
  // Delete payment
  delete: (id) => ApiService.delete(`/payments/${id}`),
};

// Radiology Requests API functions
export const radiologyRequestsAPI = {
  // Get radiology request statistics for dentist
  getStats: () => ApiService.get('/radiology-requests/stats'),
  
  // Get dentist's radiology requests
  getDentistRequests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ApiService.get(`/radiology-requests/dentist/my-requests${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get radiology center's requests
  getCenterRequests: (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return ApiService.get(`/radiology-requests/center/my-requests${params}`);
  },
  
  // Get all radiology requests (Admin only)
  getAll: () => ApiService.get('/radiology-requests'),
  
  // Get radiology request by ID
  getById: (id) => ApiService.get(`/radiology-requests/${id}`),
  
  // Create new radiology request
  create: (requestData) => ApiService.post('/radiology-requests', requestData),
  
  // Update radiology request status
  updateStatus: (id, statusData) => ApiService.patch(`/radiology-requests/${id}/status`, statusData),
  
  // Update radiology request
  update: (id, requestData) => ApiService.put(`/radiology-requests/${id}`, requestData),
  
  // Delete radiology request
  delete: (id) => ApiService.delete(`/radiology-requests/${id}`),
};

export default ApiService;