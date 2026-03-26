const path = require('path');

module.exports = {
  preset: 'ts-jest',
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testTimeout: 30000,
  testRegex: '/__tests__/.*test\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  silent: true,
  globals: {
    'ts-jest': {
      resolveJsonModule: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      module: 'ESNext',
      tsconfig: './tsconfig.test.json'
    },
    __DEV__: true
  },
  verbose: true,
  coverageReporters: ['json-summary', 'lcov', 'text'],
  setupFiles: ['./setup-mock.js'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings', 'type.ts'],
  collectCoverageFrom: [
    '**/src/**',
    '!**/vite/**',
    '!**/cjs/**',
    '!**/dist/**',
    '!**/es/**',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/interface/**',
    '!**/interface.ts',
    '!**/**.d.ts'
  ],
  moduleNameMapper: {
    '@visactor/react-vrender': path.resolve(__dirname, '../react-vrender/src/index.ts')
  }
};
