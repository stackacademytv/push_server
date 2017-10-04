// Service Worker

// Send notification on push
self.addEventListener('push', (e) => {
  self.registration.showNotification( e.data.text() )
})
