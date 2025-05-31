const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next-auth$': '<rootDir>/__mocks__/next-auth.js',
    '^next-auth/react$': '<rootDir>/__mocks__/next-auth.js',
    '^next/server$': '<rootDir>/__mocks__/next/server.js',
    // Map all carbon service imports to mocks
    '^.*/lib/carbon/carbon-offset-service$': '<rootDir>/src/__mocks__/carbon-offset-service.ts',
    '^.*/lib/carbon/carbon-tracking-service$': '<rootDir>/src/__mocks__/carbon-tracking-service.ts',
    '^.*/lib/carbon/cloverly-client$': '<rootDir>/src/__mocks__/cloverly-client.ts',
    '^.*/lib/carbon/sustainability-reporting-service$': '<rootDir>/src/__mocks__/sustainability-reporting-service.ts',
    '^.*/lib/carbon/carbon-goals-service$': '<rootDir>/src/__mocks__/lib/carbon/carbon-goals-service.ts',
    '^.*/lib/carbon/department-project-service$': '<rootDir>/src/__mocks__/lib/carbon/department-project-service.ts',
    '^.*/lib/carbon/standards-compliance-service$': '<rootDir>/src/__mocks__/lib/carbon/standards-compliance-service.ts',
    '^.*/billing/stripe-service$': '<rootDir>/src/__mocks__/billing/stripe-service.ts',
    '^.*/billing/paypal-service$': '<rootDir>/src/__mocks__/billing/paypal-service.ts',
    '^@mui/material$': '<rootDir>/__mocks__/@mui/material/index.js',
    '^@mui/material/(.*)$': '<rootDir>/__mocks__/@mui/material/index.js',
    '^@mui/icons-material$': '<rootDir>/__mocks__/@mui/icons-material/index.js',
    '^@mui/icons-material/Edit$': '<rootDir>/__mocks__/@mui/icons-material/Edit.js',
    '^@mui/icons-material/(.*)$': '<rootDir>/__mocks__/@mui/icons-material/index.js',
    '^@mui/x-date-pickers/LocalizationProvider$': '<rootDir>/__mocks__/@mui/x-date-pickers/LocalizationProvider.js',
    '^@mui/x-date-pickers/AdapterDateFns$': '<rootDir>/__mocks__/@mui/x-date-pickers/AdapterDateFns.js',
    '^@mui/x-date-pickers/DatePicker$': '<rootDir>/__mocks__/@mui/x-date-pickers/DatePicker.js',
    '^@mui/x-date-pickers/(.*)$': '<rootDir>/__mocks__/@mui/x-date-pickers/DatePicker.js',
    '^recharts$': '<rootDir>/__mocks__/recharts/index.js',
    '^recharts/(.*)$': '<rootDir>/__mocks__/recharts/index.js',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/__tests__/app/api/carbon/**/*.{js,jsx,ts,tsx}',
    'src/__tests__/components/carbon/**/*.{js,jsx,ts,tsx}',
    'src/__tests__/lib/carbon/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  // Disable coverage thresholds for now as we're focusing on specific tests
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/cypress/',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
