import axios from 'axios';

// Use the same API URL as other services
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token - check both localStorage and sessionStorage like authUtils
const getAuthToken = () => {
  // Check localStorage first (remember me)
  let token = localStorage.getItem('dentify_access_token');
  if (token) return token;
  
  // Check sessionStorage (session only)
  token = sessionStorage.getItem('dentify_access_token');
  return token;
};

// Configure axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Send message to AI chatbot
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await api.post('/api/chatbot/chat', { message });
    return response.data;
  } catch (error) {
    console.error('Send chat message error:', error);
    throw error;
  }
};

/**
 * Get FAQ response
 */
export const getFAQResponse = async (question) => {
  try {
    const response = await api.post('/api/chatbot/faq', { question });
    return response.data;
  } catch (error) {
    console.error('Get FAQ error:', error);
    throw error;
  }
};

/**
 * Get treatment information
 */
export const getTreatmentInfo = async (treatment) => {
  try {
    const response = await api.get(`/api/chatbot/treatment/${encodeURIComponent(treatment)}`);
    return response.data;
  } catch (error) {
    console.error('Get treatment info error:', error);
    throw error;
  }
};

/**
 * Get post-care instructions
 */
export const getPostCareInstructions = async (treatment) => {
  try {
    const response = await api.get(`/api/chatbot/postcare/${encodeURIComponent(treatment)}`);
    return response.data;
  } catch (error) {
    console.error('Get post-care error:', error);
    throw error;
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async () => {
  try {
    const response = await api.delete('/api/chatbot/history');
    return response.data;
  } catch (error) {
    console.error('Clear chat history error:', error);
    throw error;
  }
};

/**
 * Book appointment via chatbot
 */
export const bookAppointmentViaChatbot = async (appointmentData) => {
  try {
    const response = await api.post('/api/chatbot/book-appointment', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Book appointment error:', error);
    throw error;
  }
};
