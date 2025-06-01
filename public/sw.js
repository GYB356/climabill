/**
 * ClimaBill Service Worker
 * Provides offline capabilities and caching for better performance
 */

// Cache names
const STATIC_CACHE = 'climabill-static-v1';
const DYNAMIC_CACHE = 'climabill-dynamic-v1';
const IMAGE_CACHE = 'climabill-images-v1';
const FONT_CACHE = 'climabill-fonts-v1';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/login',
  '/signup',
  '/static/favicon.ico',
  '/static/logo.png',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine if a request should be cached
const shouldCache = (url) => {
  // Don't cache API requests
  if (url.pathname.startsWith('/api/')) {
    return false;
  }
  
  // Don't cache authentication-related endpoints
  if (url.pathname.includes('/auth/')) {
    return false;
  }

  // Don't cache blockchain API calls
  if (url.pathname.includes('/blockchain/api/')) {
    return false;
  }

  return true;
};

// Helper to determine which cache to use
const getCacheForRequest = (request) => {
  const url = new URL(request.url);
  
  if (request.destination === 'image') {
    return IMAGE_CACHE;
  }
  
  if (request.destination === 'font') {
    return FONT_CACHE;
  }
  
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/static/')) {
    return STATIC_CACHE;
  }
  
  return DYNAMIC_CACHE;
};

// Fetch event - network first with cache fallback strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip if not cacheable
  if (!shouldCache(url)) {
    return;
  }
  
  // Apply different strategies based on resource type
  if (event.request.destination === 'image') {
    // Cache-first for images
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          return caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  } else if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'font'
  ) {
    // Stale-while-revalidate for static resources
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          const cacheName = getCacheForRequest(event.request);
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
  } else {
    // Network-first for everything else
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cacheName = getCacheForRequest(event.request);
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If it's a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            return new Response('Network error', { status: 408 });
          });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-invoices') {
    event.waitUntil(syncInvoices());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/static/notification-icon.png',
      badge: '/static/badge-icon.png',
      data: data.data,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Helper function to sync invoices when online
async function syncInvoices() {
  try {
    const db = await openDB();
    const offlineInvoices = await db.getAll('offlineInvoices');
    
    for (const invoice of offlineInvoices) {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });
      
      await db.delete('offlineInvoices', invoice.id);
    }
    
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

// IndexedDB helper for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ClimaBillOfflineDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineInvoices')) {
        db.createObjectStore('offlineInvoices', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
