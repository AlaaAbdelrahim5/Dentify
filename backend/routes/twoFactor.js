const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get 2FA status
router.get('/status', twoFactorController.get2FAStatus);

// Enable 2FA (generate secret and QR code)
router.post('/enable', twoFactorController.enable2FA);

// Verify and activate 2FA
router.post('/verify', twoFactorController.verify2FA);

// Disable 2FA
router.post('/disable', twoFactorController.disable2FA);

module.exports = router;
