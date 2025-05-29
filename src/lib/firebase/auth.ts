import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  updateProfile,
  User,
  UserCredential,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  AuthError,
  getIdToken
} from 'firebase/auth';
import { auth, isDevelopment } from './config';

// Authentication service
export const authService = {
  // Email & Password Authentication
  async registerWithEmailAndPassword(email: string, password: string, displayName: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        await sendEmailVerification(userCredential.user);
      }
      return userCredential;
    } catch (error) {
      throw error;
    }
  },

  async loginWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // OAuth Authentication
  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  async signInWithGithub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider);
  },

  // Password Management
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(auth, code, newPassword);
  },

  async verifyPasswordResetCode(code: string): Promise<string> {
    return verifyPasswordResetCode(auth, code);
  },

  async updateUserPassword(user: User, currentPassword: string, newPassword: string): Promise<void> {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    return updatePassword(user, newPassword);
  },

  // Email Verification
  async verifyEmail(code: string): Promise<void> {
    return applyActionCode(auth, code);
  },

  async sendVerificationEmail(user: User): Promise<void> {
    return sendEmailVerification(user);
  },

  // Multi-factor Authentication
  async enrollMFA(user: User, phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<string> {
    const multiFactorUser = multiFactor(user);
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    
    // Send verification code
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneNumber, 
      recaptchaVerifier
    );
    
    return verificationId;
  },

  async verifyMFA(user: User, verificationId: string, verificationCode: string): Promise<void> {
    const multiFactorUser = multiFactor(user);
    const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
    
    // Enroll the user in MFA
    await multiFactorUser.enroll(multiFactorAssertion, "Phone Number");
  },

  // Session Management
  async createSession(user: User): Promise<void> {
    try {
      // Get the ID token
      const idToken = await getIdToken(user);
      
      // Call the session API to create a session cookie
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Delete the session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  // Current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Auth state observer
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }
};

// Custom error handler for authentication errors
export const handleAuthError = (error: AuthError): string => {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please try another email or login.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/invalid-credential':
      return 'Invalid login credentials. Please check and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Contact support.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this website.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing the sign-in process.';
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log in again.';
    case 'auth/multi-factor-auth-required':
      return 'Multi-factor authentication is required to complete this action.';
    default:
      return `Authentication error: ${error.message}`;
  }
};
