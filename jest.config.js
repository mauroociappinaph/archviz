/**
 * Jest Configuration
 * For testing TypeScript utilities
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(octokit|@octokit)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!**/__tests__/**/*.ts',
    '!src/infrastructure/config/Container.ts',
    '!src/app/**/*.ts',
    '!src/hooks/**/*.ts',
    '!src/interface/**/*.ts',
    '!src/infrastructure/github/**/*.ts',
    '!src/infrastructure/parser/**/*.ts',
    '!src/infrastructure/cache/**/*.ts',
    '!src/lib/export/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
