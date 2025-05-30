// Service Worker for ClimaBill PWA
const CACHE_NAME = 'climabill-cache-v1';

// Assets to cache for offline access
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/carbon/dashboard',
  '/carbon/offset',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png'
];

// Carbon data-related URLs to cache for offline use
const CARBON_API_ROUTES = [
  '/api/carbon/summary',
  '/api/carbon/emissions',
  '/api/carbon/offsets',
  '/api/carbon/goals'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => self.clients.claim())
  );
  
  return self.clients.claim();
});

// Background sync for pending carbon data
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Syncing:', event.tag);
  
  if (event.tag === 'sync-carbon-data') {
    event.waitUntil(syncCarbonData());
  } else if (event.tag === 'sync-carbon-offset-purchase') {
    event.waitUntil(syncCarbonOffsetPurchase());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Notification received', event);
  
  let data = {};
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  
  const options = {
    body: data.body || 'New update from ClimaBill',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'ClimaBill Update', 
      options
    )
  );
});

// Click event on push notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Fetch event - network first with cache fallback for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // For API requests, use network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    const isCarbonApiRoute = CARBON_API_ROUTES.some(route => 
      url.pathname.startsWith(route)
    );
    
    if (isCarbonApiRoute) {
      // Network first with cache fallback for carbon data API routes
      event.respondWith(
        fetch(request)
          .then(response => {
            // Cache the response for offline use
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clonedResponse);
            });
            return response;
          })
          .catch(() => {
            console.log('[Service Worker] Serving cached carbon data for:', url.pathname);
            return caches.match(request);
          })
      );
    } else {
      // For other API routes, just try network
      return;
    }
  } else {
    // For static assets, use cache first with network fallback
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // If not in cache, fetch from network
          return fetch(request)
            .then(networkResponse => {
              // Add the new response to cache
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clonedResponse);
              });
              return networkResponse;
            });
        })
    );
  }
});

// Helper function to sync pending carbon data
async function syncCarbonData() {
  // Retrieve carbon data from IndexedDB that needs to be synced
  const db = await openIndexedDB();
  const pendingData = await getAllPendingData(db, 'carbonData');
  
  // Process each pending data entry
  for (const data of pendingData) {
    try {
      const response = await fetch('/api/carbon/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Remove synced data from IndexedDB
        await deletePendingData(db, 'carbonData', data.id);
      }
    } catch (error) {
      console.error('[Service Worker] Sync failed for carbon data:', error);
    }
  }
}

// Helper function to sync pending carbon offset purchases
async function syncCarbonOffsetPurchase() {
  // Retrieve offset purchase data from IndexedDB that needs to be synced
  const db = await openIndexedDB();
  const pendingPurchases = await getAllPendingData(db, 'offsetPurchases');
  
  // Process each pending purchase
  for (const purchase of pendingPurchases) {
    try {
      const response = await fetch('/api/carbon/offset/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchase)
      });
      
      if (response.ok) {
        // Remove synced purchase from IndexedDB
        await deletePendingData(db, 'offsetPurchases', purchase.id);
      }
    } catch (error) {
      console.error('[Service Worker] Sync failed for offset purchase:', error);
    }
  }
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ClimaBillOfflineDB', 1);
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + request.error);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('carbonData')) {
        db.createObjectStore('carbonData', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offsetPurchases')) {
        db.createObjectStore('offsetPurchases', { keyPath: 'id' });
      }
    };
  });
}

// Helper function to get all pending data from IndexedDB
function getAllPendingData(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

// Helper function to delete pending data from IndexedDB
function deletePendingData(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve();
    };
  });
}
