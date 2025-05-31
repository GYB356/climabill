# CI/CD Repository Secrets Setup Guide

This document outlines all the secrets required for the ClimaBill CI/CD pipeline to function correctly.

## Required Secrets

### Vercel Deployment

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | API token for Vercel deployments | 1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)<br>2. Create a new token with sufficient scope<br>3. Copy the generated token |
| `VERCEL_ORG_ID` | Your Vercel organization ID | 1. Go to Vercel dashboard<br>2. Navigate to Settings → General<br>3. Copy the Organization ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID for ClimaBill | 1. Go to your project in Vercel<br>2. Navigate to Settings → General<br>3. Copy the Project ID |

### Firebase Configuration

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Firebase Console → Project Settings → General → Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console → Project Settings → General → Project ID + `.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings → General → Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console → Project Settings → General → Default bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console → Project Settings → Cloud Messaging → Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase Console → Project Settings → General → App ID (under Your apps) |

### Testing Services

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `CYPRESS_RECORD_KEY` | Cypress Dashboard recording key | 1. Create a project in Cypress Dashboard<br>2. Navigate to Project Settings<br>3. Copy the Record Key |

### Payment Processing

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key for server | Stripe Dashboard → Developers → API Keys → Secret Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client | Stripe Dashboard → Developers → API Keys → Publishable Key |
| `PAYPAL_CLIENT_ID` | PayPal client ID | PayPal Developer Dashboard → My Apps & Credentials → App credentials |
| `PAYPAL_SECRET` | PayPal secret | PayPal Developer Dashboard → My Apps & Credentials → App credentials |

## Setting Up Secrets in GitHub

1. Navigate to your GitHub repository
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value
5. Click "Add secret"

## Setting Up Secrets in Vercel

For environment variables needed in the Vercel deployment:

1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add each required variable with appropriate scope (Development, Preview, Production)
4. Click "Save"

## Secret Rotation Policy

- **Vercel tokens**: Rotate every 6 months
- **API keys**: Rotate every 3 months
- **Service account credentials**: Rotate every 6 months

## Troubleshooting

If your CI/CD pipeline fails with authentication errors:

1. Verify the secret names match exactly as specified in the workflow file
2. Check that the secrets have the correct values and haven't expired
3. Ensure the service accounts have the necessary permissions
4. Review the workflow logs for specific error messages

For persistent issues, contact the DevOps team at devops@climabill.com
