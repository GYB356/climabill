import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Use mock Firebase config for local development or when using emulator
const getMockOrRealConfig = () => {
  // If we're explicitly using the emulator, always use mock config
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    console.log('Using Firebase Auth Emulator with mock configuration.');
    return {
      apiKey: 'mock-api-key',
      authDomain: 'mock-project-id.firebaseapp.com',
      projectId: 'mock-project-id',
      storageBucket: 'mock-project-id.appspot.com',
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:abc123def456ghi789jkl'
    };
  }
  
  // Check if all required env vars are available
  const hasAllEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ].every(key => !!process.env[key]);
  
  // If we have all env vars, use them
  if (hasAllEnvVars) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  }
  
  // Use mock config for development if no env vars
  if (isDevelopment) {
    console.warn('Firebase environment variables missing. Using mock configuration for development.');
    return {
      apiKey: 'mock-api-key',
      authDomain: 'mock-project-id.firebaseapp.com',
      projectId: 'mock-project-id',
      storageBucket: 'mock-project-id.appspot.com',
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:abc123def456ghi789jkl'
    };
  }
  
  // For production, we still need real env vars
  throw new Error(
    'Missing Firebase environment variables. Please check your .env.local file or environment configuration.'
  );
};

const firebaseConfig = getMockOrRealConfig();
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (initError: any) {
  console.warn('Firebase initialization failed:', initError.message);
  console.log('Falling back to mock configuration...');
  
  // If initialization fails, use mock config
  const mockConfig = {
    apiKey: 'mock-api-key',
    authDomain: 'mock-project-id.firebaseapp.com',
    projectId: 'mock-project-id',
    storageBucket: 'mock-project-id.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abc123def456ghi789jkl'
  };
  
  app = initializeApp(mockConfig);
  auth = getAuth(app);
}

export { auth };

// Connect to auth emulator if specified or if using mock config
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' || 
    (firebaseConfig && firebaseConfig.apiKey === 'mock-api-key')) {
  console.log('Attempting to connect to Firebase Auth Emulator...');
  
  // Always connect to emulator when explicitly enabled or using mock config
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('Connected to Firebase Auth Emulator at http://localhost:9099');
  } catch (error) {
    console.warn('Failed to connect to Firebase Auth Emulator:', error);
    console.warn('Make sure the Firebase emulator is running: firebase emulators:start --only auth');
    console.warn('Falling back to offline authentication mode.');
  }
} else {
  console.log('Using production Firebase configuration');
}