const express = require('express');
const router = express.Router();

// Get Firebase configuration for client-side use (service workers, etc.)
router.get('/firebase', (req, res) => {
  try {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // Validate that all required config values are present
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      return res.status(500).json({
        error: 'Firebase configuration incomplete',
        missingKeys
      });
    }

    res.json(firebaseConfig);
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
    res.status(500).json({ error: 'Failed to retrieve Firebase configuration' });
  }
});

module.exports = router;
