import axios from 'axios';
import { authUtils } from '../utils/auth';

// Use the API base URL from env (already includes /api)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await authUtils.getAccessToken();
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
    const response = await api.post('/chatbot/chat', { message });
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
    const response = await api.post('/chatbot/faq', { question });
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
    const response = await api.get(`/chatbot/treatment/${encodeURIComponent(treatment)}`);
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
    const response = await api.get(`/chatbot/postcare/${encodeURIComponent(treatment)}`);
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
    const response = await api.delete('/chatbot/history');
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
    console.log('Mobile chatbot service - booking appointment:', appointmentData);
    const response = await api.post('/chatbot/book-appointment', appointmentData);
    console.log('Mobile chatbot service - booking success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Book appointment error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};
