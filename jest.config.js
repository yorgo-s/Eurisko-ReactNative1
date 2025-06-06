// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|@react-navigation|react-native-onesignal|@react-native-async-storage|react-native-keychain|zustand)/)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx)',
  ],
};