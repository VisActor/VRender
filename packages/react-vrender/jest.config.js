const path = require('path');

module.exports = {
  preset: 'ts-jest',
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testTimeout: 30000,
  testRegex: '/__tests__/.*\\.test\\.(ts|tsx)$',
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
    '@visactor/vrender': path.resolve(__dirname, '../vrender/src/index.ts'),
    '@visactor/vrender-core': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '@visactor/vrender-kits': path.resolve(__dirname, '../vrender-kits/src/index.ts'),
    '@visactor/vrender-animate': path.resolve(__dirname, '../vrender-animate/src/index.ts'),
    '@visactor/vrender-components': path.resolve(__dirname, '../vrender-components/src/index.ts')
  }
};
