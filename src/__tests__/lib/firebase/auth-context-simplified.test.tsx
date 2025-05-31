import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/lib/firebase/auth-context';

// Create a simplified mock auth object
const mockAuth = {
  currentUser: null
};

// Mock the Firebase config module
jest.mock('@/lib/firebase/config', () => ({
  auth: mockAuth,
  db: {}
}));

// Mock the auth state changed callback
let authStateCallback: ((user: any) => void) | null = null;

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: '123', email: 'test@example.com' } })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: '123', email: 'test@example.com' } })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    authStateCallback = callback;
    // Initial call with null user
    setTimeout(() => callback(null), 0);
    // Return mock unsubscribe function
    return jest.fn();
  }),
  getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  })),
}));

// Simplified test component
const TestComponent = () => {
  const { user, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading-state">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user-state">{user ? `User: ${user.email}` : 'No user'}</div>
    </div>
  );
};

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

// Simplified mock for window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/'
  },
  writable: true
});

describe('AuthContext - Simplified Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides initial loading state and updates after auth state change', async () => {
    // Render the AuthProvider with test component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initial state should show loading
    expect(screen.getByTestId('loading-state').textContent).toContain('Loading');
    
    // Wait for auth state to be set (null user)
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    });
    expect(screen.getByTestId('user-state').textContent).toContain('No user');
    
    // Simulate a user signing in
    act(() => {
      if (authStateCallback) {
        authStateCallback({ uid: '123', email: 'test@example.com' });
      }
    });
    
    // Verify the auth state is updated in the UI
    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toContain('User: test@example.com');
    });
  });
});
