// Service Worker for Student Life Tracker Web Push Notifications

self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Student Life Tracker';
    const options = {
      body: data.body || "Time to complete today's self-improvement checklist!",
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: {
        url: data.url || '/checklist'
      },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Open Checklist' },
        { action: 'close', title: 'Dismiss' }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[Service Worker] Push event parse error:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/checklist';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
