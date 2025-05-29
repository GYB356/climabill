# ClimaBill Authentication System

This directory contains the authentication system for ClimaBill, built with Firebase Authentication. The system has been updated to replace NextAuth completely, providing comprehensive authentication features including:

- Email/password authentication
- OAuth providers (Google, GitHub)
- Multi-Factor Authentication (MFA)
- Session management
- Password reset flows
- Email verification

## Directory Structure

- `config.ts` - Firebase configuration and initialization
- `auth.ts` - Authentication service with all auth-related functions
- `auth-context.tsx` - React context for managing authentication state across the application

## Features

### User Authentication
- Sign up with email/password
- Login with email/password
- Social login (Google, GitHub)
- Secure session management

### Security Features
- Multi-Factor Authentication (MFA) with phone verification
- Email verification
- Password strength validation
- Session management

### Account Management
- Password reset
- Profile management
- Security settings

## Usage

### Protected Routes

Use the `ProtectedRoute` component to protect routes that require authentication:

```tsx
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### Authentication Context

Access authentication state and functions using the `useAuth` hook:

```tsx
import { useAuth } from '@/lib/firebase/auth-context';

function MyComponent() {
  const { user, login, logout, error, loading } = useAuth();
  
  // Use authentication functions and state
}
```

### User Profile Component

Display user information and authentication status:

```tsx
import { UserProfile } from '@/components/user-profile';

function Header() {
  return (
    <header>
      <UserProfile />
    </header>
  );
}
```

## Setup

Follow the instructions in `firebase-config.md` to set up your Firebase project and configure environment variables.

## Migration from NextAuth

The authentication system has been migrated from NextAuth to Firebase Authentication. Here's what you need to know:

### Server-Side Authentication

Instead of using `getServerSession` from NextAuth, use `getServerUser` from `@/lib/firebase/get-server-user`:

```typescript
import { getServerUser } from '@/lib/firebase/get-server-user';

export async function GET() {
  const user = await getServerUser();
  
  if (!user) {
    // Handle unauthenticated user
  }
  
  // User is authenticated, proceed with the request
}
```

### API Route Protection

Use the `withAuth` middleware to protect API routes:

```typescript
import { withAuth } from '@/lib/firebase/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req, user) => {
  // User is authenticated, proceed with the request
  return NextResponse.json({ data: 'Protected data' });
});
```

### Client-Side Authentication

For client components that were using NextAuth's `useSession`, use the Firebase compatibility layer:

```typescript
// Import from the compatibility layer
import { useSession, signIn, signOut } from '@/lib/firebase/next-auth-compat';

// Or use the Firebase hooks directly
import { useAuth } from '@/lib/firebase/auth-context';
```

### Environment Variables

Replace NextAuth environment variables with Firebase ones:

```
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Firebase Admin (for server-side auth)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your-private-key
```
