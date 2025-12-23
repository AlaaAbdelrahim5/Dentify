// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Fetch Firebase configuration from server
// Use self.location.origin to work in both dev and production
const apiUrl = self.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : self.location.origin;

fetch(`${apiUrl}/api/config/firebase`)
  .then(response => response.json())
  .then(config => {
    // Initialize Firebase in the service worker
    firebase.initializeApp(config);

    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      const notificationTitle = payload.notification.title || 'Notification';
      const notificationOptions = {
        body: payload.notification.body || '',
        icon: '/logo.png',
        badge: '/badge.png',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  })
  .catch(error => {
    console.error('Failed to load Firebase config:', error);
  });

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle click action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
