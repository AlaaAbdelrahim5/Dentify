const { db, admin } = require('../../config/firebase-admin');

/**
 * Notification Service
 * Consolidated notification sending logic for all notification types
 */

/**
 * Send notification to user via Firestore and FCM push notification
 * @param {number|string} userId - User ID to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} options - Additional options
 * @param {string} options.type - Notification type (treatment, payment, radiology, appointment, etc.)
 * @param {Object} options.data - Additional data to include
 */
const sendNotification = async (userId, title, body, options = {}) => {
  try {
    const { type = 'general', data = {} } = options;

    // Save notification to Firestore
    await db.collection('notifications').add({
      userId: String(userId),
      title,
      body,
      type,
      data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send FCM push notification
    try {
      // Get user's FCM token from Firestore
      const userDoc = await db.collection('users').doc(String(userId)).get();
      
      if (userDoc.exists && userDoc.data().fcmToken) {
        const fcmToken = userDoc.data().fcmToken;
        
        // Convert all data values to strings (FCM requirement)
        const stringData = {};
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            stringData[key] = String(data[key]);
          });
        }
        
        const message = {
          notification: {
            title,
            body
          },
          data: {
            type: String(type),
            ...stringData
          },
          token: fcmToken
        };

        await admin.messaging().send(message);
        console.log(`FCM notification sent to user ${userId}`);
      } else {
        console.log(`No FCM token found for user ${userId}`);
      }
    } catch (fcmError) {
      // Log FCM error but don't fail the whole notification
      console.error('FCM send error:', fcmError);
    }

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    // Silent fail - don't throw errors for notifications
    return { success: false, error: error.message };
  }
};

/**
 * Send treatment notification
 * @param {number|string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
const sendTreatmentNotification = async (userId, title, body, data = {}) => {
  return sendNotification(userId, title, body, { type: 'treatment', data });
};

/**
 * Send payment notification
 * @param {number|string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
const sendPaymentNotification = async (userId, title, body, data = {}) => {
  return sendNotification(userId, title, body, { type: 'payment', data });
};

/**
 * Send radiology notification
 * @param {number|string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
const sendRadiologyNotification = async (userId, title, body, data = {}) => {
  return sendNotification(userId, title, body, { type: 'radiology', data });
};

/**
 * Send appointment notification
 * @param {number|string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
const sendAppointmentNotification = async (userId, title, body, data = {}) => {
  return sendNotification(userId, title, body, { type: 'appointment', data });
};

/**
 * Send bulk notifications to multiple users
 * @param {Array} notifications - Array of notification objects
 * Each object should have: { userId, title, body, type, data }
 */
const sendBulkNotifications = async (notifications) => {
  try {
    const batch = db.batch();
    
    notifications.forEach(({ userId, title, body, type = 'general', data = {} }) => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId: String(userId),
        title,
        body,
        type,
        data,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Bulk notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNotification,
  sendTreatmentNotification,
  sendPaymentNotification,
  sendRadiologyNotification,
  sendAppointmentNotification,
  sendBulkNotifications
};
