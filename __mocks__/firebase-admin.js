// Mock Firebase Admin SDK
module.exports = {
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn(),
      doc: jest.fn(),
    })),
  })),
  auth: {
    getAuth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    })),
  },
  firestore: {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(),
      doc: jest.fn(),
    })),
  },
  credential: {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  },
};
