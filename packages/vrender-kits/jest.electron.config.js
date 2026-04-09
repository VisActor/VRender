const path = require('path');
const { createElectronPackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createElectronPackageJestConfig({
  rootDir: __dirname,
  testRegex: '/__tests__/.*test\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  setupFiles: ['./setup-mock.js'],
  tsconfig: './tsconfig.test.json',
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings', 'type.ts'],
  collectCoverageFrom: [
    '**/src/**',
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
    '@visactor/vrender-core': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '@visactor/vrender-animate': path.resolve(__dirname, '../vrender-animate/src/index.ts')
  }
});
