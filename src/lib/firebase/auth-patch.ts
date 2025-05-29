// Firebase Auth patch to fix 'Cannot read properties of undefined (reading 'create')' error
// This file needs to be imported before any Firebase Auth code is used

// Create a more comprehensive mock error factory
const mockErrorFactory = {
  create: (code: string, message: string) => {
    const error = new Error(message || code);
    (error as any).code = code;
    return error;
  }
};

// Apply patch to global scope - ensure this runs in both browser and server environments
if (typeof globalThis !== 'undefined') {
  // Ensure firebase auth internal namespace exists
  globalThis._firebase_auth_internal = globalThis._firebase_auth_internal || {};
  
  // Add the error factory
  globalThis._firebase_auth_internal.ErrorFactory = mockErrorFactory;
  
  // Add other potentially missing internal properties
  globalThis._firebase_auth_internal.logClient = globalThis._firebase_auth_internal.logClient || {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  // Create the firebase namespace if it doesn't exist
  globalThis.firebase = globalThis.firebase || {};
  globalThis.firebase.auth = globalThis.firebase.auth || {};
  
  // Add the error factory to the auth namespace
  globalThis.firebase.auth.ErrorFactory = mockErrorFactory;
  
  // Ensure the auth internal state is initialized
  if (typeof window !== 'undefined') {
    window._firebase_auth_internal = window._firebase_auth_internal || globalThis._firebase_auth_internal;
    window.firebase = window.firebase || globalThis.firebase;
  }
}

export {};
