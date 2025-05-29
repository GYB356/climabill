# Firebase Authentication Migration Guide

This document outlines the changes made to migrate the ClimaBill application from NextAuth to Firebase Authentication.

## Summary of Changes

### Removed Components
- Removed NextAuth API routes and configuration files
- Removed NextAuth dependency from package.json
- Removed NextAuth session handling from middleware and components

### Added Components
- Firebase Authentication service (`auth.ts`)
- Firebase Admin SDK initialization (`admin.ts`)
- Server-side authentication utilities (`get-server-user.ts` and `server-auth.ts`)
- API route protection middleware (`api-auth.ts`)
- Session cookie management for Firebase Auth
- MFA utilities for TOTP and recovery codes

### Updated Components
- Authentication provider components to use Firebase Auth
- Middleware to use Firebase session cookies
- API routes to use Firebase authentication
- Environment variable requirements

## How to Use Firebase Authentication

### Server-Side Authentication
```typescript
// In server components or API routes
import { getServerUser } from '@/lib/firebase/get-server-user';

// Get the current user
const user = await getServerUser();

// Check if user is authenticated
if (!user) {
  // Handle unauthenticated user
}

// Access user properties
const { uid, email, name, role } = user;
```

### API Route Protection
```typescript
// In API route handlers
import { withAuth, withAuthRole } from '@/lib/firebase/api-auth';
import { NextRequest, NextResponse } from 'next/server';

// Protect route with authentication
export const GET = withAuth(async (req, user) => {
  // User is authenticated, proceed with the request
  return NextResponse.json({ data: 'Protected data' });
});

// Protect route with authentication and role check
export const POST = withAuthRole(async (req, user) => {
  // User is authenticated and has the required role
  return NextResponse.json({ data: 'Admin data' });
}, 'admin');
```

### Client-Side Authentication
```typescript
// In client components
import { useAuth } from '@/lib/firebase/auth-context';

function MyComponent() {
  const { user, login, logout, error, loading } = useAuth();
  
  // Check if user is authenticated
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  // Access user properties
  const { uid, email, displayName } = user;
  
  return (
    <div>
      <h1>Welcome, {displayName || email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### NextAuth Compatibility Layer
For components that were using NextAuth, a compatibility layer is provided:

```typescript
// Import from the compatibility layer
import { useSession, signIn, signOut } from '@/lib/firebase/next-auth-compat';

function MyComponent() {
  const { data, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not authenticated</div>;
  
  return (
    <div>
      <h1>Welcome, {data?.user?.name || data?.user?.email}</h1>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

## Environment Variables

The following environment variables are required for Firebase Authentication:

```
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## Additional Features

### Multi-Factor Authentication (MFA)
Firebase Authentication supports MFA with TOTP (Time-based One-Time Password) and SMS verification. The implementation includes:

- MFA setup API route
- MFA verification API route
- Recovery code generation
- QR code generation for authenticator apps

### Role-Based Access Control
Firebase Authentication supports custom claims for role-based access control. The implementation includes:

- Role verification in middleware
- Role-based API route protection
- Role management in the authentication service

## Next Steps

1. Install the required dependencies:
   ```
   npm install
   ```

2. Set up your Firebase project and configure environment variables as described in the Firebase Configuration Guide.

3. Test the authentication flow to ensure everything works as expected.

4. Update any remaining components that might still be using NextAuth.

## References

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
