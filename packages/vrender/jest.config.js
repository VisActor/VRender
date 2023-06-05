module.exports = {
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testTimeout: 30000,
  testRegex: '/__tests__/.*test\\.ts?$',
  testPathIgnorePatterns: ['<rootDir>/old_packages'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  preset: 'ts-jest',
  silent: true,
  globals: {
    'ts-jest': {
      tsconfig: {
        resolveJsonModule: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        module: 'ESNext'
      }
    },
    __DEV__: true
  },
  collectCoverageFrom: ['**/*.{ts}', '!**/node_modules/**'],
  moduleNameMapper: {
    '^@vrender/(.*)$': '<rootDir>/packages/$1/src'
  }
};
