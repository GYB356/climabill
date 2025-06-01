#!/usr/bin/env node

// Simple authentication test script
const EMAIL = 'test@example.com';
const PASSWORD = 'testpassword123';

console.log('🧪 Testing Firebase Authentication Setup');
console.log('=====================================');

// Test environment variables
console.log('\n📋 Environment Configuration:');
console.log('NEXT_PUBLIC_USE_FIREBASE_EMULATOR:', process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR);
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Test Firebase emulator connection
console.log('\n🔌 Testing Firebase Emulator Connection:');
const testEmulatorConnection = async () => {
  try {
    const response = await fetch('http://localhost:9099/emulator/v1/projects/mock-project-id/config');
    if (response.ok) {
      console.log('✅ Firebase Auth Emulator is running and accessible');
      return true;
    } else {
      console.log('❌ Firebase Auth Emulator is not responding correctly');
      return false;
    }
  } catch (error) {
    console.log('❌ Firebase Auth Emulator is not running:', error.message);
    return false;
  }
};

// Test app accessibility
console.log('\n🌐 Testing Application Accessibility:');
const testAppConnection = async () => {
  try {
    const response = await fetch('http://localhost:9002/login');
    if (response.ok) {
      console.log('✅ Next.js application is running and accessible');
      return true;
    } else {
      console.log('❌ Next.js application is not responding correctly');
      return false;
    }
  } catch (error) {
    console.log('❌ Next.js application is not running:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  const emulatorOk = await testEmulatorConnection();
  const appOk = await testAppConnection();
  
  console.log('\n📊 Test Results Summary:');
  console.log('=======================');
  console.log(`Firebase Emulator: ${emulatorOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Next.js App: ${appOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (emulatorOk && appOk) {
    console.log('\n🎉 All tests passed! Authentication should be working.');
    console.log('\n📝 Next Steps:');
    console.log('1. Open http://localhost:9002/login in your browser');
    console.log('2. Try creating a new account with any email/password');
    console.log('3. Try logging in with the same credentials');
    console.log('4. Check the browser console for authentication logs');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the setup.');
    if (!emulatorOk) {
      console.log('• Start Firebase emulator: firebase emulators:start --only auth --project demo-climabill');
    }
    if (!appOk) {
      console.log('• Start Next.js app: npm run dev');
    }
  }
};

runTests().catch(console.error);
