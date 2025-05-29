// This script patches the Firebase Auth error factory issue
// The error "Cannot read properties of undefined (reading 'create')" happens because
// Firebase Auth attempts to use an internal error factory that doesn't exist

// Create a simple error factory
const createErrorFactory = () => {
  return {
    create: (code, message) => {
      const error = new Error(message || code);
      error.code = code;
      return error;
    }
  };
};

// Apply the patch to different contexts depending on the environment
if (typeof window !== 'undefined') {
  // Browser environment
  window._firebase_auth_internal = window._firebase_auth_internal || {};
  window._firebase_auth_internal.ErrorFactory = window._firebase_auth_internal.ErrorFactory || createErrorFactory();
  
  // Also patch the global firebase object in case it's referenced directly
  window.firebase = window.firebase || {};
  window.firebase.auth = window.firebase.auth || {};
  window.firebase.auth.ErrorFactory = window.firebase.auth.ErrorFactory || createErrorFactory();
}

if (typeof globalThis !== 'undefined') {
  // Edge runtime or any other JavaScript environment
  globalThis._firebase_auth_internal = globalThis._firebase_auth_internal || {};
  globalThis._firebase_auth_internal.ErrorFactory = globalThis._firebase_auth_internal.ErrorFactory || createErrorFactory();
}

// Export nothing - this is just for side effects
export {};
