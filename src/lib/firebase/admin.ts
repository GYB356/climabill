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
export function getFirebaseAdmin(): FirebaseAdminInstance {
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
  
  // Initialize Firebase Admin with service account
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
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
