const CACHE_NAME = 'prochepro-v4';
const STATIC_CACHE = 'prochepro-static-v4';
const DYNAMIC_CACHE = 'prochepro-dynamic-v4';

// Static assets to precache (only files that exist)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets with error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      // Cache each asset individually to prevent one failure from breaking all
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((error) => {
            console.warn(`Failed to cache ${url}:`, error.message);
            return null; // Continue even if one fails
          })
        )
      );
    }).catch((error) => {
      console.error('Cache installation failed:', error);
      // Don't fail the installation, just log the error
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('prochepro-') && 
                   name !== CACHE_NAME && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Helper: Is request for a page (HTML)?
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

// Helper: Is request for static asset?
function isStaticAsset(url) {
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.mp3'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Fetch event - different strategies for different requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests
  if (url.pathname.includes('/api/')) return;

  // Skip external domains
  if (url.origin !== self.location.origin) return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Strategy: Cache First for static assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy: Network First for pages, with offline fallback
  if (isPageRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to return cached page
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for navigation requests
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Strategy: Network First for other requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    data = { title: 'ProchePro', body: 'Nouvelle notification' };
  }
  
  console.log('[SW] Push notification data:', data);
  
  // Generate unique tag to ensure notification shows even if previous one exists
  const uniqueTag = data.tag || `prochepro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Ensure absolute URLs for Android compatibility
  const baseUrl = 'https://prochepro.fr';
  
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || `${baseUrl}/icons/icon-192x192.png`,
    badge: data.badge || `${baseUrl}/icons/icon-72x72.png`,
    image: data.image || undefined,
    // Stronger vibration pattern for locked screen
    vibrate: [300, 200, 300, 200, 300, 200, 500],
    tag: uniqueTag,
    renotify: true,
    requireInteraction: true, // Always require interaction for important notifications
    silent: false, // Never silent - we want sound
    timestamp: data.timestamp || Date.now(),
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || Date.now(),
      notificationData: data,
    },
    actions: data.actions || [
      {
        action: 'open',
        title: 'Ouvrir',
      },
      {
        action: 'close',
        title: 'Fermer',
      }
    ],
    dir: 'auto',
    lang: 'fr',
  };

  console.log('[SW] Showing notification with options:', options);

  // CRITICAL: Use event.waitUntil to keep SW alive until notification is shown
  const notificationPromise = self.registration.showNotification(
    data.title || 'ProchePro', 
    options
  ).then(() => {
    console.log('[SW] ✅ Notification shown successfully');
    return true;
  }).catch((error) => {
    console.error('[SW] ❌ Failed to show notification:', error);
    // Try showing a simple notification as fallback
    return self.registration.showNotification('ProchePro', {
      body: data.body || 'Nouvelle notification',
      icon: `${baseUrl}/icons/icon-192x192.png`,
      badge: `${baseUrl}/icons/icon-72x72.png`,
      requireInteraction: true,
    });
  });

  // Send to all open clients for in-app notification
  const clientsPromise = self.clients.matchAll({ 
    type: 'window', 
    includeUncontrolled: true 
  }).then((clients) => {
    console.log('[SW] Sending to', clients.length, 'clients');
    clients.forEach((client) => {
      client.postMessage({
        type: 'push-notification',
        data: {
          title: data.title || 'ProchePro',
          body: data.body || 'Nouvelle notification',
          url: data.url || '/',
          icon: data.icon,
          timestamp: Date.now(),
        }
      });
    });
  }).catch(err => {
    console.error('[SW] Failed to notify clients:', err);
  });

  event.waitUntil(Promise.all([notificationPromise, clientsPromise]));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    });
  }
});

// Background sync for offline actions (future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Placeholder for future background sync implementation
  console.log('Background sync triggered');
}

