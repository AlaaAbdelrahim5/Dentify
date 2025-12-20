const express = require('express');
const router = express.Router();
const { messaging, db } = require('../config/firebase-admin');
const { authenticate } = require('../middleware/auth');

// Send a push notification
router.post('/send', authenticate, async (req, res) => {
  try {
    const { userId, title, body, data, fcmToken } = req.body;

    if (!userId && !fcmToken) {
      return res.status(400).json({ error: 'userId or fcmToken is required' });
    }

    let token = fcmToken;

    // If userId provided, get FCM token from database
    if (!token && userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      token = userDoc.data().fcmToken;
    }

    if (!token) {
      return res.status(400).json({ error: 'No FCM token found for user' });
    }

    // Prepare notification message
    const message = {
      notification: {
        title: title || 'Notification',
        body: body || ''
      },
      data: data || {},
      token
    };

    // Send notification
    const response = await messaging.send(message);

    // Store notification in Firestore
    await db.collection('notifications').add({
      userId,
      title,
      body,
      data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      messageId: response,
      message: 'Notification sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
});

// Send notification to multiple users
router.post('/send-multiple', authenticate, async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Get FCM tokens for all users
    const tokens = [];
    const notificationPromises = [];

    for (const userId of userIds) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists && userDoc.data().fcmToken) {
        tokens.push(userDoc.data().fcmToken);
        
        // Store notification in Firestore
        notificationPromises.push(
          db.collection('notifications').add({
            userId,
            title,
            body,
            data,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          })
        );
      }
    }

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'No valid FCM tokens found' });
    }

    // Send multicast notification
    const message = {
      notification: {
        title: title || 'Notification',
        body: body || ''
      },
      data: data || {},
      tokens
    };

    const response = await messaging.sendMulticast(message);
    await Promise.all(notificationPromises);

    res.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: 'Notifications sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send notifications',
      details: error.message 
    });
  }
});

// Subscribe to topic
router.post('/subscribe-topic', authenticate, async (req, res) => {
  try {
    const { fcmToken, topic } = req.body;

    if (!fcmToken || !topic) {
      return res.status(400).json({ error: 'fcmToken and topic are required' });
    }

    await messaging.subscribeToTopic(fcmToken, topic);

    res.json({ 
      success: true,
      message: `Successfully subscribed to topic: ${topic}` 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to subscribe to topic',
      details: error.message 
    });
  }
});

// Send notification to topic
router.post('/send-to-topic', authenticate, async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const message = {
      notification: {
        title: title || 'Notification',
        body: body || ''
      },
      data: data || {},
      topic
    };

    const response = await messaging.send(message);

    res.json({ 
      success: true, 
      messageId: response,
      message: `Notification sent to topic: ${topic}` 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send notification to topic',
      details: error.message 
    });
  }
});

module.exports = router;
