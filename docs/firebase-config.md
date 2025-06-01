# Firebase Configuration for Development

This document explains how to set up Firebase credentials for local development.

## Environment Variables

The application requires Firebase configuration for authentication. These values should be stored in a `.env.local` file at the root of the project.

### Required Environment Variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID

### Additional Environment Variables

- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID

## Development Setup

For local development, you have two options:

### Option 1: Use a Mock Configuration (Recommended for Development)

The application now supports a mock configuration for development. If Firebase environment variables are missing, the application will automatically use mock values and connect to the Firebase Auth Emulator if available.

This allows developers to work on the application without needing actual Firebase credentials.

### Option 2: Use Real Firebase Configuration

1. Copy the `.env.example` file to `.env.local`
   ```
   cp .env.example .env.local
   ```

2. Replace the placeholder values in `.env.local` with your actual Firebase project details

## Firebase Emulator

For local development, you can use the Firebase Emulator Suite to mock Firebase services:

1. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Start the Firebase emulators:
   ```
   firebase emulators:start
   ```

The application will automatically connect to the Firebase Auth emulator running on http://localhost:9099 when using the mock configuration.

## Troubleshooting

If you encounter authentication issues:

1. Check that your `.env.local` file contains the correct Firebase configuration values
2. If using the emulator, ensure it's running before starting the application
3. Check browser console for Firebase-related errors
