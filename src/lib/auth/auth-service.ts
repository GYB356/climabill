/**
 * Firebase Authentication Service
 * 
 * This file provides authentication services using Firebase Auth.
 * It replaces the NextAuth authentication service with Firebase-specific implementations.
 */

import { getAuthAdmin, getFirestoreAdmin } from './auth-config';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAuth } from '../firebase/auth';

/**
 * User authentication service
 */
export const AuthService = {
  /**
   * Get user by ID from Firestore
   * @param userId User ID
   * @returns User data or null
   */
  async getUserById(userId: string) {
    try {
      const firestore = getFirestoreAdmin();
      const userDoc = await firestore.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },
  
  /**
   * Get user by email from Firebase Auth
   * @param email User email
   * @returns User data or null
   */
  async getUserByEmail(email: string) {
    try {
      const auth = getAuthAdmin();
      const userRecord = await auth.getUserByEmail(email);
      
      if (!userRecord) {
        return null;
      }
      
      // Get additional user data from Firestore
      const userData = await this.getUserById(userRecord.uid);
      
      return {
        id: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        ...userData,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },
  
  /**
   * Create a new user in Firebase Auth and Firestore
   * @param userData User data
   * @returns Created user or null
   */
  async createUser(userData: {
    email: string;
    password: string;
    displayName?: string;
    photoURL?: string;
    role?: string;
  }) {
    try {
      const auth = getAuthAdmin();
      
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });
      
      // Set custom claims for role
      if (userData.role) {
        await auth.setCustomUserClaims(userRecord.uid, {
          role: userData.role,
        });
      }
      
      // Create user document in Firestore
      const firestore = getFirestoreAdmin();
      await firestore.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return {
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: userData.role || 'user',
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  /**
   * Update user in Firebase Auth and Firestore
   * @param userId User ID
   * @param userData User data to update
   * @returns Updated user or null
   */
  async updateUser(userId: string, userData: {
    email?: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
    role?: string;
  }) {
    try {
      const auth = getAuthAdmin();
      
      // Update user in Firebase Auth
      const updateParams: any = {};
      if (userData.email) updateParams.email = userData.email;
      if (userData.password) updateParams.password = userData.password;
      if (userData.displayName) updateParams.displayName = userData.displayName;
      if (userData.photoURL) updateParams.photoURL = userData.photoURL;
      
      await auth.updateUser(userId, updateParams);
      
      // Update custom claims for role
      if (userData.role) {
        await auth.setCustomUserClaims(userId, {
          role: userData.role,
        });
      }
      
      // Update user document in Firestore
      const firestore = getFirestoreAdmin();
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      if (userData.email) updateData.email = userData.email;
      if (userData.displayName) updateData.displayName = userData.displayName;
      if (userData.photoURL) updateData.photoURL = userData.photoURL;
      if (userData.role) updateData.role = userData.role;
      
      await firestore.collection('users').doc(userId).update(updateData);
      
      // Get updated user
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  /**
   * Delete user from Firebase Auth and Firestore
   * @param userId User ID
   * @returns Boolean indicating success
   */
  async deleteUser(userId: string) {
    try {
      const auth = getAuthAdmin();
      const firestore = getFirestoreAdmin();
      
      // Delete user from Firebase Auth
      await auth.deleteUser(userId);
      
      // Delete user document from Firestore
      await firestore.collection('users').doc(userId).delete();
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },
  
  /**
   * Verify session token
   * @param token Session token
   * @returns Decoded token or null
   */
  async verifySessionToken(token: string): Promise<DecodedIdToken | null> {
    try {
      const auth = getAuthAdmin();
      return await auth.verifySessionCookie(token, true);
    } catch (error) {
      console.error('Error verifying session token:', error);
      return null;
    }
  },
  
  /**
   * Create session cookie
   * @param idToken Firebase ID token
   * @param expiresIn Cookie expiration in milliseconds
   * @returns Session cookie string
   */
  async createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
    try {
      const auth = getAuthAdmin();
      return await auth.createSessionCookie(idToken, { expiresIn });
    } catch (error) {
      console.error('Error creating session cookie:', error);
      throw error;
    }
  }
};
