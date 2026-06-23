const path = require('path');
const { createElectronPackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createElectronPackageJestConfig({
  rootDir: __dirname,
  testRegex: '/__tests__/.*\\.test\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  setupFiles: ['./setup-mock.js'],
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
    '@visactor/vrender': path.resolve(__dirname, '../vrender/src/index.ts'),
    '@visactor/vrender-core': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '@visactor/vrender-kits': path.resolve(__dirname, '../vrender-kits/src/index.ts'),
    '@visactor/vrender-animate': path.resolve(__dirname, '../vrender-animate/src/index.ts'),
    '@visactor/vrender-components': path.resolve(__dirname, '../vrender-components/src/index.ts')
  }
});
