/**
 * Service Worker Registration
 * Registers the service worker for offline support and caching
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Helper function to check if service worker is active
export function isServiceWorkerActive(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }
  
  return navigator.serviceWorker.getRegistration()
    .then(registration => !!registration && !!registration.active);
}

// Helper function to update service worker
export function updateServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }
  
  return navigator.serviceWorker.getRegistration()
    .then(registration => {
      if (registration) {
        return registration.update();
      }
    });
}

// Helper function to unregister service worker
export function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }
  
  return navigator.serviceWorker.getRegistration()
    .then(registration => {
      if (registration) {
        return registration.unregister();
      }
      return false;
    });
}

// Helper to trigger background sync
export function triggerBackgroundSync(tag: string): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }
  
  return navigator.serviceWorker.ready
    .then(registration => {
      if ('sync' in registration) {
        return registration.sync.register(tag);
      }
    });
}
