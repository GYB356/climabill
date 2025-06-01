# Firebase Authentication in Development Mode

## Overview

This project uses Firebase Authentication for user management. In development mode, there are three ways to work with authentication:

1. Using real Firebase credentials (preferred for feature development)
2. Using Firebase Auth Emulator (good for offline development)
3. Using offline mock authentication (fallback when emulator isn't running)

## Setup Instructions

### Option 1: Using Real Firebase Credentials

1. Create a `.env.local` file in the root directory
2. Copy the contents from `.env.example`
3. Replace the placeholder values with your actual Firebase project credentials
4. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`

### Option 2: Using Firebase Auth Emulator

1. Create a `.env.local` file in the root directory
2. Copy the contents from `.env.example` (mock values are fine)
3. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`
4. Start the Firebase emulators:

```bash
firebase emulators:start
```

### Option 3: Offline Mock Authentication (Fallback)

If you can't use the Firebase Auth Emulator and don't have real credentials, the system will automatically fall back to offline mock authentication.

In offline mode:
- Any email is accepted
- The password must be "password" for all accounts
- User data is stored in memory and will be lost on page refresh

## Troubleshooting

### "Firebase: Error (auth/network-request-failed)"

This error occurs when:
1. You don't have real Firebase credentials
2. The Firebase Auth Emulator isn't running
3. There's a network connectivity issue

**Solutions:**

1. Start the Firebase emulators: `firebase emulators:start`
2. Add real Firebase credentials to `.env.local`
3. Let the system use offline authentication (for basic testing)

### Login Doesn't Work in Development

Use these test credentials in offline mode:
- Email: any valid email format (e.g., `test@example.com`)
- Password: `password`

## Environment Variables

Important environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`: Set to "true" to use the Firebase Auth Emulator
