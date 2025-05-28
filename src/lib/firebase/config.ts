// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  User, 
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  NextOrObserver
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key-for-development-only",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abc123def456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MOCK123456",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Initialize Firebase app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  
  if (isDevelopment) {
    console.log('Using mock Firebase implementation for development');
    
    // Create a mock user for development
    const mockUser: User = {
      uid: 'mock-user-id',
      email: 'mock@example.com',
      emailVerified: true,
      displayName: 'Mock User',
      isAnonymous: false,
      photoURL: 'https://example.com/mock-photo.jpg',
      providerData: [],
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      tenantId: null,
      delete: () => Promise.resolve(),
      getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () => Promise.resolve({
        token: 'mock-id-token',
        signInProvider: 'password',
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        issuedAtTime: new Date().toISOString(),
        authTime: new Date().toISOString(),
        claims: {},
      }),
      reload: () => Promise.resolve(),
      toJSON: () => ({}),
      phoneNumber: null,
      providerId: 'password',
    };
    
    // Create a mock auth implementation
    const mockAuth: Partial<Auth> = {
      app,
      name: 'mock-auth',
      currentUser: mockUser,
      languageCode: 'en',
      settings: {
        appVerificationDisabledForTesting: true,
      },
      onAuthStateChanged: (nextOrObserver: NextOrObserver<User>) => {
        if (typeof nextOrObserver === 'function') {
          setTimeout(() => nextOrObserver(mockUser), 0);
        } else {
          setTimeout(() => nextOrObserver.next(mockUser), 0);
        }
        return () => {};
      },
      beforeAuthStateChanged: () => () => {},
      useDeviceLanguage: () => {},
      signOut: () => Promise.resolve(),
      updateCurrentUser: () => Promise.resolve(),
      createUserWithEmailAndPassword: () => Promise.resolve({ user: mockUser } as UserCredential),
      signInWithEmailAndPassword: () => Promise.resolve({ user: mockUser } as UserCredential),
      signInWithCustomToken: () => Promise.resolve({ user: mockUser } as UserCredential),
      signInAnonymously: () => Promise.resolve({ user: mockUser } as UserCredential),
      signInWithPopup: () => Promise.resolve({ user: mockUser } as UserCredential),
      signInWithRedirect: () => Promise.resolve(),
      signInWithCredential: () => Promise.resolve({ user: mockUser } as UserCredential),
      sendPasswordResetEmail: () => Promise.resolve(),
      verifyPasswordResetCode: () => Promise.resolve('mock@example.com'),
      confirmPasswordReset: () => Promise.resolve(),
      applyActionCode: () => Promise.resolve(),
      checkActionCode: () => Promise.resolve({ operation: 'RESET_PASSWORD', data: { email: 'mock@example.com' } }),
      fetchSignInMethodsForEmail: () => Promise.resolve(['password']),
      isSignInWithEmailLink: () => true,
      signInWithEmailLink: () => Promise.resolve({ user: mockUser } as UserCredential),
      generateSignInWithEmailLink: () => Promise.resolve('https://example.com/sign-in-link'),
      setPersistence: () => Promise.resolve(),
      connectAuthEmulator: () => {},
      sendSignInLinkToEmail: () => Promise.resolve(),
      getRedirectResult: () => Promise.resolve({ user: mockUser } as UserCredential),
      tenantId: null,
    };
    
    // Use our mock auth instead of the real Firebase auth
    auth = mockAuth as unknown as Auth;
    
    // Our mock auth implementation is now complete
    // No need for additional overrides since we've replaced the entire auth object
    
  } else {
    // Use real Firebase auth in production
    auth = getAuth(app);
  }
  
  // Initialize Firestore (real or emulator based on environment)
  db = getFirestore(app);
  
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Provide fallback implementations to prevent app from crashing
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db };
