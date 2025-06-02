// jest.setup.js
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

// Mock the next-i18next package
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/carbon/gamified-dashboard',
    query: {},
  }),
}));

// Mock localStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => 'mock-auth-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
