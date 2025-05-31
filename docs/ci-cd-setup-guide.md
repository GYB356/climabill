# ClimaBill CI/CD Setup Guide

This document provides instructions for configuring the CI/CD pipeline for the ClimaBill application.

## Required GitHub Repository Secrets

The following secrets need to be configured in your GitHub repository to enable the CI/CD pipeline to run successfully:

### Firebase Configuration Secrets

These secrets are used for Firebase authentication and Firestore database access:

| Secret Name | Description | How to Obtain |
|-------------|-------------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Firebase Console > Project Settings > General > Web App Configuration |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console > Project Settings > General > Web App Configuration |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console > Project Settings > General > Web App Configuration |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Firebase Console > Project Settings > General > Web App Configuration |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Firebase Console > Project Settings > General > Web App Configuration |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Firebase Console > Project Settings > General > Web App Configuration |

### Vercel Deployment Secrets

These secrets are required for automated deployments to Vercel:

| Secret Name | Description | How to Obtain |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel API Token | Vercel Dashboard > Settings > Tokens > Create Token |
| `VERCEL_ORG_ID` | Vercel Organization ID | Vercel Dashboard > Settings > General > Your Organization ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Vercel Dashboard > Project Settings > General > Project ID |

### Cypress Testing Secret

This secret is required for recording Cypress test runs:

| Secret Name | Description | How to Obtain |
|-------------|-------------|--------------|
| `CYPRESS_RECORD_KEY` | Cypress Dashboard Record Key | Cypress Dashboard > Project Settings > Record Key |

## How to Configure GitHub Repository Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** > **Secrets and variables** > **Actions**
3. Click on **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**
6. Repeat for each required secret

## Environment Configuration

The CI/CD pipeline uses two environments:

1. **Staging**: Used for testing changes before production deployment
2. **Production**: The live environment for end users

Make sure to configure both environments in your GitHub repository settings under **Settings** > **Environments**.

## CI/CD Pipeline Flow

1. **Test**: Runs linting, type checking, unit tests, and builds the application
2. **Deploy to Staging**: Deploys the application to the staging environment if tests pass
3. **E2E Tests**: Runs Cypress E2E tests against the staging deployment
4. **Deploy to Production**: Deploys the application to production if E2E tests pass

## Troubleshooting

If you encounter issues with the CI/CD pipeline:

1. Check that all required secrets are correctly configured
2. Verify Firebase configuration values match your Firebase project
3. Ensure Vercel project is properly set up and connected
4. Check Cypress configuration and record key validity

## Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Cypress Dashboard](https://dashboard.cypress.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
