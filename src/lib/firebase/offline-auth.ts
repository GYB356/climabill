// For a development environment without Firebase Auth Emulator running,
// we need to implement mock authentication functions to allow for testing.

import { User, AuthError } from 'firebase/auth';

// Mock user object that simulates a Firebase User
export const createMockUser = (email: string): User => {
  return {
    uid: `mock-uid-${Date.now()}`,
    email,
    emailVerified: true,
    isAnonymous: false,
    displayName: email.split('@')[0],
    photoURL: null,
    providerId: 'password',
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => Promise.resolve(),
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
      token: 'mock-id-token',
      signInProvider: 'password',
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      issuedAtTime: new Date().toISOString(),
      claims: {}
    }),
    reload: async () => Promise.resolve(),
    toJSON: () => ({
      uid: `mock-uid-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    }),
    phoneNumber: null
  } as User;
};

// Mock users database for offline development
const mockUsers = new Map<string, { email: string; password: string; user: User }>();

// Predefined test users for development
const TEST_USERS = [
  { email: 'test@example.com', password: 'password123' },
  { email: 'admin@climabill.com', password: 'admin123' },
  { email: 'user@test.com', password: 'test123' },
  { email: 'demo@demo.com', password: 'demo123' }
];

// Initialize test users
TEST_USERS.forEach(({ email, password }) => {
  const user = createMockUser(email);
  mockUsers.set(email, { email, password, user });
});

// Function to simulate Firebase authentication in offline mode
export const offlineAuth = {
  // Store the current mock user
  currentUser: null as User | null,
  
  // Mock email/password login
  async loginWithEmailAndPassword(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw createAuthError('auth/invalid-credential');
    }
    
    // Check if user exists in our mock database
    const existingUser = mockUsers.get(email);
    if (!existingUser) {
      throw createAuthError('auth/user-not-found');
    }
    
    // Check password
    if (existingUser.password !== password) {
      throw createAuthError('auth/wrong-password');
    }
    
    // Create a fresh user object with updated timestamp
    const user = createMockUser(email);
    this.currentUser = user;
    
    console.log(`🔓 Offline login successful for: ${email}`);
    return user;
  },
  
  // Mock signup
  async createUserWithEmailAndPassword(email: string, password: string): Promise<User> {
    if (!email) {
      throw createAuthError('auth/invalid-email');
    }
    
    if (!password || password.length < 6) {
      throw createAuthError('auth/weak-password');
    }
    
    // Check if user already exists
    if (mockUsers.has(email)) {
      throw createAuthError('auth/email-already-in-use');
    }
    
    // Create a new mock user and store in database
    const user = createMockUser(email);
    mockUsers.set(email, { email, password, user });
    this.currentUser = user;
    
    console.log(`📝 Offline signup successful for: ${email}`);
    return user;
  },
  
  // Mock logout
  async signOut(): Promise<void> {
    this.currentUser = null;
    console.log('👋 Offline logout successful');
    return Promise.resolve();
  },
  
  // Helper method to get test users for development
  getTestUsers(): Array<{ email: string; password: string }> {
    return TEST_USERS;
  }
};

// Helper to create Firebase AuthError objects
function createAuthError(code: string): AuthError {
  return {
    code,
    message: `Firebase: Error (${code}).`,
    name: 'FirebaseError',
    customData: {}
  } as AuthError;
}
