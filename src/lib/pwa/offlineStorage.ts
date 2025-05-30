/**
 * Utilities for offline storage using IndexedDB
 * This enables offline access to carbon data and syncing when back online
 */

const DB_NAME = 'ClimaBillOfflineDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  CARBON_DATA: 'carbonData',
  OFFSET_PURCHASES: 'offsetPurchases',
  USER_SETTINGS: 'userSettings',
  CARBON_GOALS: 'carbonGoals',
};

/**
 * Open a connection to the IndexedDB database
 */
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.CARBON_DATA)) {
        db.createObjectStore(STORES.CARBON_DATA, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.OFFSET_PURCHASES)) {
        db.createObjectStore(STORES.OFFSET_PURCHASES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.USER_SETTINGS)) {
        db.createObjectStore(STORES.USER_SETTINGS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.CARBON_GOALS)) {
        db.createObjectStore(STORES.CARBON_GOALS, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save carbon data for offline use
 */
export async function saveCarbonData(data: any): Promise<string> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CARBON_DATA, 'readwrite');
    const store = transaction.objectStore(STORES.CARBON_DATA);

    // Add timestamp and sync status
    const item = {
      ...data,
      id: data.id || crypto.randomUUID(),
      createdAt: data.createdAt || new Date(),
      needsSync: true,
    };

    const request = store.put(item);

    request.onerror = () => {
      console.error('Error saving carbon data:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => registration.sync.register('sync-carbon-data'))
          .catch(err => console.error('Background sync registration failed:', err));
      }
      resolve(item.id);
    };
  });
}

/**
 * Save carbon offset purchase for offline use
 */
export async function saveOffsetPurchase(data: any): Promise<string> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.OFFSET_PURCHASES, 'readwrite');
    const store = transaction.objectStore(STORES.OFFSET_PURCHASES);

    // Add timestamp and sync status
    const item = {
      ...data,
      id: data.id || crypto.randomUUID(),
      purchaseDate: data.purchaseDate || new Date(),
      needsSync: true,
    };

    const request = store.put(item);

    request.onerror = () => {
      console.error('Error saving offset purchase:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => registration.sync.register('sync-carbon-offset-purchase'))
          .catch(err => console.error('Background sync registration failed:', err));
      }
      resolve(item.id);
    };
  });
}

/**
 * Get all carbon data (can be used for offline viewing)
 */
export async function getAllCarbonData(userId: string): Promise<any[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CARBON_DATA, 'readonly');
    const store = transaction.objectStore(STORES.CARBON_DATA);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Error getting carbon data:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      // Filter by user ID if provided
      const results = request.result;
      resolve(userId ? results.filter(item => item.userId === userId) : results);
    };
  });
}

/**
 * Get all offset purchases (can be used for offline viewing)
 */
export async function getAllOffsetPurchases(userId: string): Promise<any[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.OFFSET_PURCHASES, 'readonly');
    const store = transaction.objectStore(STORES.OFFSET_PURCHASES);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Error getting offset purchases:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      // Filter by user ID if provided
      const results = request.result;
      resolve(userId ? results.filter(item => item.userId === userId) : results);
    };
  });
}

/**
 * Save user settings for offline use
 */
export async function saveUserSettings(settings: any): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.USER_SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.USER_SETTINGS);

    const request = store.put(settings);

    request.onerror = () => {
      console.error('Error saving user settings:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Get user settings (for offline use)
 */
export async function getUserSettings(userId: string): Promise<any> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.USER_SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.USER_SETTINGS);
    const request = store.get(userId);

    request.onerror = () => {
      console.error('Error getting user settings:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

/**
 * Save carbon goal for offline use
 */
export async function saveCarbonGoal(goal: any): Promise<string> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CARBON_GOALS, 'readwrite');
    const store = transaction.objectStore(STORES.CARBON_GOALS);

    // Add timestamp and sync status
    const item = {
      ...goal,
      id: goal.id || crypto.randomUUID(),
      createdAt: goal.createdAt || new Date(),
      updatedAt: new Date(),
      needsSync: true,
    };

    const request = store.put(item);

    request.onerror = () => {
      console.error('Error saving carbon goal:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => registration.sync.register('sync-carbon-goals'))
          .catch(err => console.error('Background sync registration failed:', err));
      }
      resolve(item.id);
    };
  });
}

/**
 * Get all carbon goals (for offline viewing)
 */
export async function getCarbonGoals(userId: string): Promise<any[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CARBON_GOALS, 'readonly');
    const store = transaction.objectStore(STORES.CARBON_GOALS);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Error getting carbon goals:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      // Filter by user ID if provided
      const results = request.result;
      resolve(userId ? results.filter(item => item.userId === userId || item.organizationId === userId) : results);
    };
  });
}

/**
 * Clear specific data from IndexedDB
 */
export async function clearStoreData(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => {
      console.error(`Error clearing ${storeName}:`, request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Check if there's pending data that needs to be synced
 */
export async function hasPendingData(): Promise<boolean> {
  try {
    const db = await openDatabase();
    const carbonData = await getAllWithKey(db, STORES.CARBON_DATA, 'needsSync', true);
    const offsetPurchases = await getAllWithKey(db, STORES.OFFSET_PURCHASES, 'needsSync', true);
    const carbonGoals = await getAllWithKey(db, STORES.CARBON_GOALS, 'needsSync', true);
    
    return carbonData.length > 0 || offsetPurchases.length > 0 || carbonGoals.length > 0;
  } catch (error) {
    console.error('Error checking pending data:', error);
    return false;
  }
}

/**
 * Helper function to get all items with a specific key/value
 */
async function getAllWithKey(
  db: IDBDatabase,
  storeName: string,
  key: string,
  value: any
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      const results = request.result;
      resolve(results.filter(item => item[key] === value));
    };
  });
}
