# ClimaBill Authentication System

This directory contains the authentication system for ClimaBill, built with Firebase Authentication. The system provides comprehensive authentication features including:

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
