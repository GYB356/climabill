// Test authentication by directly calling the login function
async function testLogin() {
  console.log('🧪 Testing authentication flow...');
  
  try {
    // Import the auth functions
    const { offlineAuth } = await import('./src/lib/firebase/offline-auth.ts');
    
    console.log('\n1. Testing offline authentication...');
    
    // Test login with test credentials
    const user = await offlineAuth.loginWithEmailAndPassword('test@example.com', 'password123');
    
    console.log('✅ Login successful!');
    console.log('User:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    // Check current user
    console.log('\n2. Checking current user state...');
    console.log('Current user:', offlineAuth.currentUser?.email || 'null');
    
    // Test logout
    console.log('\n3. Testing logout...');
    await offlineAuth.signOut();
    console.log('Current user after logout:', offlineAuth.currentUser?.email || 'null');
    
    console.log('\n✅ All tests passed! Authentication is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLogin();
