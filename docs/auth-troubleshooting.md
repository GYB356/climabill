## 🔧 Authentication Troubleshooting Guide

### Common Authentication Errors and Solutions

#### ❌ `auth/wrong-password` Error

**Problem**: You're getting a "wrong password" error when trying to login.

**Solutions**:

1. **Using Firebase Emulator (Development)**:
   - The emulator creates a fresh database each time it starts
   - Previously created accounts are lost when emulator restarts
   - **Solution**: Create a new account or use predefined test accounts

2. **Test Accounts Available**:
   ```
   Email: test@example.com     | Password: password123
   Email: admin@climabill.com  | Password: admin123
   Email: user@test.com        | Password: test123
   Email: demo@demo.com        | Password: demo123
   ```

3. **Offline Mode (Fallback)**:
   - If emulator isn't running, system uses offline authentication
   - Only accepts the predefined test accounts above
   - Create accounts work with any email/password (min. 6 chars)

#### ❌ `auth/user-not-found` Error

**Problem**: Account doesn't exist in the current authentication system.

**Solutions**:
1. **Create a new account** using the signup page
2. **Use predefined test accounts** (see above)
3. **Check if emulator restarted** - accounts are lost on restart

#### ❌ `auth/api-key-not-valid` Error

**Problem**: Firebase API key validation issues.

**Status**: ✅ **RESOLVED** - System now uses mock credentials for development

**How it was fixed**:
- Updated `.env.local` to use mock API keys when emulator is enabled
- Enhanced error handling to fall back to offline mode
- Proper emulator connection logic

#### ✅ How Authentication Works Now

1. **Primary**: Firebase Auth Emulator (port 9099)
   - Fresh database on each restart
   - Supports full Firebase auth features
   - Use test accounts or create new ones

2. **Fallback**: Offline Authentication
   - When emulator is unavailable
   - Uses predefined test accounts
   - Stored in memory (lost on page refresh)

3. **Error Handling**: Automatic graceful degradation
   - Clear error messages with development hints
   - Helpful console logging
   - User-friendly guidance

#### 🧪 Testing Instructions

1. **Check System Status**:
   ```bash
   # Verify emulator is running
   curl http://localhost:9099/emulator/v1/projects/demo-climabill/config
   
   # Check Next.js app
   curl http://localhost:9002
   ```

2. **Test Login Flow**:
   - Open: http://localhost:9002/login
   - Try: `test@example.com` / `password123`
   - Or create new account with any credentials

3. **Check Console Logs**:
   - Browser: F12 → Console tab
   - Look for helpful authentication messages
   - Emulator status and fallback indicators

#### 🔍 Debugging Tips

1. **Clear Browser Data**: Sometimes auth state gets cached
2. **Check Emulator**: Ensure it's running on port 9099
3. **Console Logs**: Look for authentication flow messages
4. **Test Accounts**: Use predefined credentials first
5. **Create Fresh Account**: If login fails, try signup instead

#### 📞 Quick Fixes

- **Wrong Password**: Use `password123`, `admin123`, `test123`, or `demo123`
- **User Not Found**: Create new account or use test credentials
- **Emulator Issues**: Restart with `firebase emulators:start --only auth --project demo-climabill`
- **Network Errors**: System automatically falls back to offline mode

Your authentication system is now robust and developer-friendly! 🚀
