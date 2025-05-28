# Firebase Configuration Guide

To set up Firebase authentication for this project, follow these steps:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Register your app in the Firebase project
3. Enable the Authentication methods you want to use:
   - Email/Password
   - Google
   - GitHub
   - Phone (for MFA)
4. Create a `.env.local` file in the root of your project with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

5. Replace the placeholder values with your actual Firebase project credentials
6. Restart your development server to apply the changes

## Security Considerations

- Never commit your `.env.local` file to version control
- For production, set these environment variables in your hosting platform's configuration
- Consider using Firebase App Check for additional security
- Review Firebase Authentication security rules regularly
