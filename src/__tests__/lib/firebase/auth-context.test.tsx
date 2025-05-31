import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import * as firebaseAuth from 'firebase/auth';

// Better error handling
const originalConsoleError = console.error;
console.error = (...args) => {
  // Log for debugging purposes but don't fail tests on expected errors
  if (args[0]?.includes('Error: Not implemented: navigation')) {
    // Ignore Next.js navigation errors in tests
    return;
  }
  originalConsoleError(...args);
};

// Define a mock for the auth state change callback function
const mockAuthStateChanged = jest.fn();

// Define locationMock in the outer scope so it can be accessed in afterEach
let locationMock: any;

// Create mock user data
const mockUser = { uid: '123', email: 'test@example.com' };

// Mock the Firebase config module first
jest.mock('@/lib/firebase/config', () => ({
  auth: undefined, // Return undefined for auth so the real auth functions are called with undefined
  db: {}
}));

// Mock Firebase auth with proper implementations
jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  return {
    __esModule: true,
    ...originalModule,
    getAuth: jest.fn(() => undefined),
    signInWithEmailAndPassword: jest.fn((auth, email, password) => {
      // Test expects auth to be undefined
      return Promise.resolve({
        user: mockUser
      });
    }),
    createUserWithEmailAndPassword: jest.fn((auth, email, password) => {
      // Test expects auth to be undefined
      return Promise.resolve({
        user: mockUser
      });
    }),
    signOut: jest.fn(() => Promise.resolve()),
    sendPasswordResetEmail: jest.fn((auth, email) => Promise.resolve()),
    onAuthStateChanged: jest.fn((auth, callback) => {
      // Store the callback to call it later with mock user data
      mockAuthStateChanged.mockImplementation((user) => {
        try {
          callback(user);
        } catch (e) {
          console.log('Error in auth callback:', e);
        }
      });
      
      // Initial call with null user (not logged in)
      setTimeout(() => {
        try {
          callback(null);
        } catch (e) {
          console.log('Error in initial auth callback:', e);
        }
      }, 0); 
      
      return jest.fn(); // Return unsubscribe function
    }),
    signInWithPopup: jest.fn(() => Promise.resolve({ user: mockUser })),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({
      providerId: 'google.com'
    })),
    GithubAuthProvider: jest.fn().mockImplementation(() => ({
      providerId: 'github.com'
    })),
    EmailAuthProvider: {
      credential: jest.fn(() => 'mock-credential')
    },
    reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
    updatePassword: jest.fn(() => Promise.resolve()),
    sendEmailVerification: jest.fn(() => Promise.resolve()),
    getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
    updateProfile: jest.fn(),
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  })),
}));

// Mock fetch for session cookie
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

  // Test component that uses the auth context
const TestComponent = () => {
  const { 
    user, 
    loading, 
    login, 
    signup, 
    logout, 
    resetPassword,
    loginWithGoogle,
    loginWithGithub,
    updateUserPassword,
    sendVerificationEmail,
    clearError,
    error
  } = useAuth();
  
  const handleLogin = () => {
    login('test@example.com', 'password');
  };
  
  const handleSignup = () => {
    signup('test@example.com', 'password');
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const handleResetPassword = () => {
    resetPassword('test@example.com');
  };
  
  const handleGoogleLogin = () => {
    loginWithGoogle();
  };
  
  const handleGithubLogin = () => {
    loginWithGithub();
  };
  
  const handleUpdatePassword = () => {
    updateUserPassword('oldpassword', 'newpassword');
  };
  
  const handleSendVerification = () => {
    sendVerificationEmail();
  };
  
  const handleClearError = () => {
    clearError();
  };
  
  const handleErrorLogin = () => {
    // This will cause an error because we mocked the login function to fail once
    login('test@example.com', 'password');
  };

  return (
    <div>
      <div data-testid="loading-state">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user-state">{user ? 'User logged in' : 'No user'}</div>
      <div data-testid="error-state">{error ? error.message : ''}</div>
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="signup-button" onClick={handleSignup}>
        Signup
      </button>
      <button data-testid="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <button data-testid="reset-button" onClick={handleResetPassword}>
        Reset Password
      </button>
      <button data-testid="google-button" onClick={handleGoogleLogin}>
        Google Login
      </button>
      <button data-testid="github-button" onClick={handleGithubLogin}>
        Github Login
      </button>
      <button data-testid="update-password-button" onClick={handleUpdatePassword}>
        Update Password
      </button>
      <button data-testid="verify-button" onClick={handleSendVerification}>
        Verify Email
      </button>
      <button data-testid="clear-error-button" onClick={handleClearError}>
        Clear Error
      </button>
      <button data-testid="error-login-button" onClick={handleErrorLogin}>
        Error Login
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Setup detailed error tracking for debugging
    jest.spyOn(console, 'error').mockImplementation((error) => {
      // Log errors to help with debugging but don't let them fail tests
      if (typeof error === 'string' && (
          error.includes('Not implemented: navigation') ||
          error.includes('Invalid hook call') ||
          error.includes('act(...)')
      )) {
        return; // Ignore expected errors
      }
      // Log unexpected errors for debugging
      console.log('TEST ERROR:', error);
    });
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockAuthStateChanged.mockClear();
    
    // Define testing mocks and behaviors with robust error handling
    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockImplementation((auth, email, password) => {
      return Promise.resolve({
        user: { uid: '123', email: 'test@example.com' }
      });
    });
    
    (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockImplementation((auth, email, password) => {
      return Promise.resolve({
        user: { uid: '123', email: 'test@example.com' }
      });
    });
    
    (firebaseAuth.signOut as jest.Mock).mockImplementation(() => Promise.resolve());
    (firebaseAuth.sendPasswordResetEmail as jest.Mock).mockImplementation(() => Promise.resolve());
    
    (firebaseAuth.signInWithPopup as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        user: { uid: '123', email: 'test@example.com' }
      });
    });
    
    (firebaseAuth.reauthenticateWithCredential as jest.Mock).mockImplementation(() => Promise.resolve());
    (firebaseAuth.updatePassword as jest.Mock).mockImplementation(() => Promise.resolve());
    (firebaseAuth.sendEmailVerification as jest.Mock).mockImplementation(() => Promise.resolve());
    (firebaseAuth.getIdToken as jest.Mock).mockImplementation(() => Promise.resolve('mock-id-token'));
    
    // Setup onAuthStateChanged mock to properly handle auth state changes
    (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      mockAuthStateChanged.mockImplementation((user) => {
        try {
          callback(user);
        } catch (e) {
          console.log('Error in auth callback:', e);
        }
      });
      
      // Initial call with null user (not logged in)
      setTimeout(() => {
        try {
          callback(null);
        } catch (e) {
          console.log('Error in initial auth callback:', e);
        }
      }, 0); 
      
      return jest.fn(); // Return unsubscribe function
    });
    
    // Create a safer mock for window.location that doesn't throw errors
    locationMock = {
      pathname: '/',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: jest.fn(() => 'http://localhost/'),
      hash: '',
      host: 'localhost',
      hostname: 'localhost',
      href: 'http://localhost/',
      origin: 'http://localhost',
      port: '',
      protocol: 'http:',
      search: ''
    };
    
    // Create a safe mock for window.location using a non-destructive approach
    // that doesn't try to overwrite the property entirely
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: function() { return locationMock; }
    });
  });
  
  afterEach(() => {
    // Restore any overrides of window properties
    jest.restoreAllMocks();
    
    // Reset location mocks
    if (locationMock && typeof locationMock === 'object') {
      if (locationMock.assign && typeof locationMock.assign === 'function') {
        (locationMock.assign as jest.Mock).mockClear();
      }
      if (locationMock.replace && typeof locationMock.replace === 'function') {
        (locationMock.replace as jest.Mock).mockClear();
      }
      if (locationMock.reload && typeof locationMock.reload === 'function') {
        (locationMock.reload as jest.Mock).mockClear();
      }
    }
  });

  test('provides loading state initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the initial state to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    }, { timeout: 2000 });
    
    expect(screen.getByTestId('user-state')).toHaveTextContent('No user');
  });

  test('updates user state when auth state changes', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the initial state to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    }, { timeout: 2000 });
    
    // Simulate auth state change with a user
    const mockUser = { 
      uid: '123', 
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    // Call mockAuthStateChanged to simulate a logged in user
    act(() => {
      mockAuthStateChanged(mockUser);
    });
    
    // Check that user state is updated
    await waitFor(() => {
      expect(screen.getByTestId('user-state')).toHaveTextContent('User logged in');
    }, { timeout: 2000 });
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });

  test('login with email calls signInWithEmailAndPassword and creates session cookie', async () => {
    // Render the component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // Trigger login
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Check if Firebase auth was called correctly
    await waitFor(() => {
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        undefined, 
        'test@example.com', 
        'password'
      );
    }, { timeout: 2000 });
    
    // Simulate auth state changed after successful login
    await act(async () => {
      mockAuthStateChanged(mockUser);
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check if session cookie was created
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/session', expect.any(Object));
    }, { timeout: 2000 });
  });

  test('signup calls createUserWithEmailAndPassword', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('signup-button'));
    });
    
    // Check if createUserWithEmailAndPassword was called with the right params
    await waitFor(() => {
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        undefined,
        'test@example.com',
        'password'
      );
    }, { timeout: 2000 });
    
    // Verify session cookie is requested
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/session', expect.any(Object));
    }, { timeout: 2000 });
    
    // Simulate auth state changed after successful signup
    await act(async () => {
      mockAuthStateChanged(mockUser);
    });
  });

  test('logout calls signOut and deletes session cookie', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // First make sure we show No user initially
    expect(screen.getByTestId('user-state').textContent).toContain('No user');
    
    // Simulate a user being logged in
    await act(async () => {
      mockAuthStateChanged(mockUser);
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Wait for the user state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toContain('test@example.com');
    }, { timeout: 2000 });
    
    // Trigger logout
    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-button'));
    });
    
    // Check if signOut was called and session cookie is deleted
    await waitFor(() => {
      expect(firebaseAuth.signOut).toHaveBeenCalledWith(undefined);
      expect(global.fetch).toHaveBeenCalledWith('/api/session', { method: 'DELETE' });
    }, { timeout: 2000 });
    
    // Simulate auth state changed after logout (null user)
    await act(async () => {
      mockAuthStateChanged(null);
    });
  });  

  test('clearError resets error state', async () => {
    // Setup login to fail once to set an error
    (firebaseAuth.signInWithEmailAndPassword as jest.Mock)
      .mockRejectedValueOnce({
        code: 'auth/invalid-email',
        message: 'Test error message'
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });

    // Trigger login to cause an error
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-button'));
      // Give time for the promise rejection to be processed
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Wait for error to be set in state
    await waitFor(() => {
      expect(screen.getByTestId('error-state').textContent).toContain('Test error message');
    }, { timeout: 2000 });

    // Clear the error
    await act(async () => {
      fireEvent.click(screen.getByTestId('clear-error-button'));
    });

    // Check if error was cleared
    await waitFor(() => {
      expect(screen.getByTestId('error-state').textContent).not.toContain('Test error message');
    }, { timeout: 2000 });
  });
  
  test('resetPassword calls sendPasswordResetEmail', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // Trigger password reset
    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-button'));
    });
    
    // Check if sendPasswordResetEmail was called with the right params
    await waitFor(() => {
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
        undefined,
        'test@example.com'
      );
    }, { timeout: 2000 });
  });
  
  test('loginWithGoogle calls signInWithPopup with GoogleAuthProvider', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // Trigger Google login
    await act(async () => {
      fireEvent.click(screen.getByTestId('google-button'));
    });
    
    // Check if signInWithPopup was called with GoogleAuthProvider
    await waitFor(() => {
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      // Verify the provider was a GoogleAuthProvider instance
      expect(firebaseAuth.GoogleAuthProvider).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    // Simulate successful auth state change after Google login
    await act(async () => {
      mockAuthStateChanged(mockUser);
    });
  });
  
  test('loginWithGithub calls signInWithPopup with GithubAuthProvider', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // Trigger Github login
    await act(async () => {
      fireEvent.click(screen.getByTestId('github-button'));
    });
    
    // Check if signInWithPopup was called with GithubAuthProvider
    await waitFor(() => {
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      // Verify the provider was a GithubAuthProvider instance
      expect(firebaseAuth.GithubAuthProvider).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    // Simulate successful auth state change after Github login
    await act(async () => {
      mockAuthStateChanged(mockUser);
    });
  });
  
  test('updateUserPassword calls reauthenticateWithCredential and updatePassword', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // First make sure we show No user initially
    expect(screen.getByTestId('user-state').textContent).toContain('No user');
    
    // Simulate a user being logged in - we need to wrap in act to ensure React processes the state update
    await act(async () => {
      mockAuthStateChanged(mockUser);
      // Small delay to allow React to process the state update
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Wait for the user state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toContain('User logged in');
    }, { timeout: 2000 });
    
    // Click the update password button
    fireEvent.click(screen.getByTestId('update-password-button'));
    
    // Check if the functions were called with the right params
    await waitFor(() => {
      expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalled();
      expect(firebaseAuth.updatePassword).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
  
  test('sendVerificationEmail calls sendEmailVerification', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // First make sure we show No user initially
    expect(screen.getByTestId('user-state').textContent).toContain('No user');
    
    // Simulate a user being logged in - we need to wrap in act to ensure React processes the state update
    await act(async () => {
      mockAuthStateChanged(mockUser);
      // Small delay to allow React to process the state update
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Wait for the user state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toContain('User logged in');
    }, { timeout: 2000 });
    
    // Click the verify email button
    fireEvent.click(screen.getByTestId('verify-button'));
    
    // Check if sendEmailVerification was called
    await waitFor(() => {
      expect(firebaseAuth.sendEmailVerification).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
  
  test('redirects to dashboard after login for auth pages', async () => {
    // Update locationMock to simulate being on an auth page
    locationMock.pathname = '/auth/signin';
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to be done
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toContain('Not Loading');
    }, { timeout: 2000 });
    
    // Simulate a user signing in
    act(() => {
      mockAuthStateChanged({ uid: '123', email: 'test@example.com' });
    });
    
    // Wait for the user state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toContain('User logged in');
    }, { timeout: 2000 });
    
    // Check if router.push was called with dashboard
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });
