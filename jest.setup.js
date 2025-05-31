// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Mock the fetch API
global.fetch = jest.fn();

// Mock the window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver;

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Firebase
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn().mockReturnValue({
      name: '[DEFAULT]',
    }),
    getApps: jest.fn().mockReturnValue([]),
    getApp: jest.fn().mockReturnValue({
      name: '[DEFAULT]',
    }),
  };
});

// Mock the Firebase config module specifically
jest.mock('./src/lib/firebase/config', () => {
  // Create mock functions that match the firestore mock structure
  const createDocRef = () => ({
    get: jest.fn().mockResolvedValue({
      id: 'mock-id',
      data: jest.fn().mockReturnValue({}),
      exists: jest.fn().mockReturnValue(true),
    }),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  const createCollectionRef = () => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    doc: jest.fn().mockReturnValue(createDocRef()),
    where: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      }),
    }),
    orderBy: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      }),
    }),
    limit: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      }),
    }),
    get: jest.fn().mockResolvedValue({
      docs: [],
      empty: true,
      size: 0,
    }),
  });
  
  return {
    db: createCollectionRef(),
    auth: {
      currentUser: null,
      onAuthStateChanged: jest.fn(),
    },
    default: {},
  };
});

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn().mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn(),
      signInWithEmailAndPassword: jest.fn(),
      createUserWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
    }),
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockAdd = jest.fn();
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockSet = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
  const mockQuery = jest.fn();

  // Mock chain-able methods
  const createQueryChain = () => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [],
      empty: true,
      size: 0,
    }),
  });

  const createDocRef = () => ({
    get: jest.fn().mockResolvedValue({
      id: 'mock-id',
      data: jest.fn().mockReturnValue({}),
      exists: jest.fn().mockReturnValue(true),
    }),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  const createCollectionRef = () => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    doc: jest.fn().mockReturnValue(createDocRef()),
    where: jest.fn().mockReturnValue(createQueryChain()),
    orderBy: jest.fn().mockReturnValue(createQueryChain()),
    limit: jest.fn().mockReturnValue(createQueryChain()),
    get: jest.fn().mockResolvedValue({
      docs: [],
      empty: true,
      size: 0,
    }),
  });

  return {
    getFirestore: jest.fn(),
    collection: jest.fn().mockReturnValue(createCollectionRef()),
    doc: jest.fn().mockReturnValue(createDocRef()),
    addDoc: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    getDoc: jest.fn().mockResolvedValue({
      id: 'mock-id',
      data: jest.fn().mockReturnValue({}),
      exists: jest.fn().mockReturnValue(true),
    }),
    getDocs: jest.fn().mockResolvedValue({
      docs: [],
      empty: true,
      size: 0,
    }),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn().mockReturnValue(createQueryChain()),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    onSnapshot: jest.fn(),
    Timestamp: {
      now: jest.fn().mockReturnValue({
        toDate: jest.fn().mockReturnValue(new Date()),
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      }),
      fromDate: jest.fn().mockImplementation((date) => ({
        toDate: jest.fn().mockReturnValue(date),
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      })),
    },
  };
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
