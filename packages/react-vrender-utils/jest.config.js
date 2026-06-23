const path = require('path');
const { createStablePackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createStablePackageJestConfig({
  environment: 'jsdom',
  testRegex: '/__tests__/.*test\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  setupFiles: ['../../share/jest-config/browser-globals.js', './setup-mock.js'],
  testPathIgnorePatterns: ['__tests__/electron'],
  tsconfig: './tsconfig.test.json',
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
});
