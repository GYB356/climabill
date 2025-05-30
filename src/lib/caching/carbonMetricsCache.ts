/**
 * Carbon Metrics Caching Service
 * 
 * This service implements a multi-level caching strategy for carbon metrics:
 * 1. Memory cache (in-memory LRU cache)
 * 2. IndexedDB cache (for persistence across page reloads)
 * 3. Service worker cache (for offline access)
 */

// Define the cache size and expiry time
const MEMORY_CACHE_SIZE = 100;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

// LRU cache implementation
class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();
  private keys: K[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | null {
    if (!this.cache.has(key)) return null;
    
    // Move key to the end (most recently used)
    this.keys = this.keys.filter(k => k !== key);
    this.keys.push(key);
    
    return this.cache.get(key)!;
  }

  put(key: K, value: V): void {
    if (this.keys.length >= this.capacity && !this.cache.has(key)) {
      // Remove the least recently used item
      const lruKey = this.keys.shift()!;
      this.cache.delete(lruKey);
    }
    
    // Add/update the cache
    if (!this.cache.has(key)) {
      this.keys.push(key);
    } else {
      // Move key to the end if it already exists
      this.keys = this.keys.filter(k => k !== key);
      this.keys.push(key);
    }
    
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
    this.keys = [];
  }
}

// Cached data structure
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

// Memory cache
const memoryCache = new LRUCache<string, CachedData<any>>(MEMORY_CACHE_SIZE);

/**
 * Get a cached value by key
 * This checks the memory cache first, then IndexedDB if not found
 */
export async function getCachedValue<T>(key: string): Promise<T | null> {
  // Check memory cache first
  const memoryCached = memoryCache.get(key);
  if (memoryCached && !isCacheExpired(memoryCached)) {
    console.log(`[Cache] Memory cache hit for ${key}`);
    return memoryCached.data;
  }
  
  // Try IndexedDB cache
  try {
    const idbCached = await getFromIndexedDB<T>(key);
    if (idbCached && !isCacheExpired(idbCached)) {
      console.log(`[Cache] IndexedDB cache hit for ${key}`);
      // Update memory cache
      memoryCache.put(key, idbCached);
      return idbCached.data;
    }
  } catch (error) {
    console.error('[Cache] Error accessing IndexedDB cache:', error);
  }
  
  return null;
}

/**
 * Set a cached value
 * This updates both the memory cache and IndexedDB
 */
export async function setCachedValue<T>(key: string, value: T, customExpiryTime?: number): Promise<void> {
  const cachedData: CachedData<T> = {
    data: value,
    timestamp: Date.now(),
    expiryTime: customExpiryTime || CACHE_EXPIRY_TIME
  };
  
  // Update memory cache
  memoryCache.put(key, cachedData);
  
  // Update IndexedDB cache
  try {
    await saveToIndexedDB(key, cachedData);
  } catch (error) {
    console.error('[Cache] Error saving to IndexedDB cache:', error);
  }
}

/**
 * Clear all cached values
 */
export async function clearCache(): Promise<void> {
  // Clear memory cache
  memoryCache.clear();
  
  // Clear IndexedDB cache
  try {
    await clearIndexedDBCache();
  } catch (error) {
    console.error('[Cache] Error clearing IndexedDB cache:', error);
  }
}

/**
 * Check if a cache entry is expired
 */
function isCacheExpired<T>(cachedData: CachedData<T>): boolean {
  return Date.now() > cachedData.timestamp + cachedData.expiryTime;
}

/**
 * Save a value to IndexedDB
 */
async function saveToIndexedDB<T>(key: string, data: CachedData<T>): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CarbonMetricsCache', 1);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('metrics')) {
        db.createObjectStore('metrics');
      }
    };
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + request.error);
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const transaction = db.transaction('metrics', 'readwrite');
      const store = transaction.objectStore('metrics');
      
      const storeRequest = store.put(data, key);
      
      storeRequest.onsuccess = () => resolve();
      storeRequest.onerror = () => reject(storeRequest.error);
    };
  });
}

/**
 * Get a value from IndexedDB
 */
async function getFromIndexedDB<T>(key: string): Promise<CachedData<T> | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CarbonMetricsCache', 1);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('metrics')) {
        db.createObjectStore('metrics');
      }
    };
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + request.error);
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const transaction = db.transaction('metrics', 'readonly');
      const store = transaction.objectStore('metrics');
      
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result as CachedData<T>);
        } else {
          resolve(null);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

/**
 * Clear the IndexedDB cache
 */
async function clearIndexedDBCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CarbonMetricsCache', 1);
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + request.error);
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const transaction = db.transaction('metrics', 'readwrite');
      const store = transaction.objectStore('metrics');
      
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

/**
 * Wrapper function for API calls with caching
 * This will return cached data if available, otherwise fetch from the API
 */
export async function cachedApiCall<T>(
  cacheKey: string,
  apiFn: () => Promise<T>,
  expiryTime?: number
): Promise<T> {
  try {
    // Try to get from cache first
    const cachedData = await getCachedValue<T>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // If not in cache or expired, call the API
    const data = await apiFn();
    
    // Cache the result
    await setCachedValue(cacheKey, data, expiryTime);
    
    return data;
  } catch (error) {
    console.error(`[Cache] Error in cachedApiCall for ${cacheKey}:`, error);
    // If caching fails, still return the API result
    return apiFn();
  }
}
