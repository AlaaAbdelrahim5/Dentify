const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/auth');

// All chatbot routes require authentication
router.use(authenticate);

// Chat with AI assistant
router.post('/chat', chatbotController.chat);

// Get FAQ response
router.post('/faq', chatbotController.getFAQ);

// Get treatment information
router.get('/treatment/:treatment', chatbotController.getTreatmentInfo);

// Get post-care instructions
router.get('/postcare/:treatment', chatbotController.getPostCare);

// Clear chat history
router.delete('/history', chatbotController.clearHistory);

// Get available dentists for booking
router.get('/available-dentists', chatbotController.getAvailableDentists);

// Get available time slots for a dentist
router.get('/available-slots', chatbotController.getAvailableSlots);

// Book appointment via chatbot
router.post('/book-appointment', chatbotController.bookAppointment);

module.exports = router;
