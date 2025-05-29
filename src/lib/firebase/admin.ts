"use server";

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

interface FirebaseAdminInstance {
  app: App;
  auth: Auth;
  firestore: Firestore;
}

// Initialize Firebase Admin SDK
export async function getFirebaseAdmin(): Promise<FirebaseAdminInstance> {
  const apps = getApps();
  
  // Return existing instance if already initialized
  if (apps.length > 0) {
    const app = apps[0];
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app)
    };
  }

  if (!process.env.FIREBASE_PROJECT_ID || 
      !process.env.FIREBASE_CLIENT_EMAIL || 
      !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing required Firebase Admin environment variables');
  }
  
  // Initialize Firebase Admin with service account
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/^"|"$/g, ''),
    privateKey: process.env.FIREBASE_PRIVATE_KEY
  };
  
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}
