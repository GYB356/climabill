"use client";

import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  isRegistered: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Hook to register and manage service worker for PWA functionality
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isOffline: false,
    hasUpdate: false,
    registration: null,
  });

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported by this browser');
      return;
    }

    // Check online status
    const handleOnlineStatusChange = () => {
      setState(prevState => ({
        ...prevState,
        isOffline: !navigator.onLine,
      }));
    };

    // Register the service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        setState(prevState => ({
          ...prevState,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prevState => ({
                  ...prevState,
                  hasUpdate: true,
                }));
              }
            });
          }
        });

        console.log('Service Worker registered successfully', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Initialize
    registerServiceWorker();
    handleOnlineStatusChange();

    // Set up event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  /**
   * Update the service worker to the latest version
   */
  const updateServiceWorker = async () => {
    if (state.registration && state.hasUpdate) {
      state.registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  };

  /**
   * Request permission for push notifications
   */
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  return {
    ...state,
    updateServiceWorker,
    requestNotificationPermission,
  };
}
