/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/scripts/**'],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
}
