// Debug script to test authentication state flow
const { offlineAuth } = require('./src/lib/firebase/offline-auth.ts');

async function testAuthFlow() {
  console.log('🔍 Testing authentication state flow...');
  
  try {
    // Test login
    console.log('\n1. Testing offline login...');
    const user = await offlineAuth.loginWithEmailAndPassword('test@example.com', 'password123');
    console.log('✅ Login successful:', { uid: user.uid, email: user.email });
    console.log('Current user in offlineAuth:', offlineAuth.currentUser?.email || 'null');
    
    // Test logout
    console.log('\n2. Testing logout...');
    await offlineAuth.signOut();
    console.log('Current user after logout:', offlineAuth.currentUser?.email || 'null');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthFlow();
