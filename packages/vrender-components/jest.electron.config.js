const path = require('path');
const { createElectronPackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createElectronPackageJestConfig({
  rootDir: __dirname,
  testRegex: '/__tests__/.*\\.test\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['./setup-mock.js'],
  tsconfig: './tsconfig.test.json',
  collectCoverageFrom: ['src/**/*.ts', '!**/type/**'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings', 'type.ts'],
  moduleNameMapper: {
    '@visactor/vrender-kits': path.resolve(__dirname, '../vrender-kits/src/index.ts'),
    '@visactor/vrender-core': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '@visactor/vrender/es/core': path.resolve(__dirname, '../vrender/src/index.ts'),
    '@visactor/vrender/es/register': path.resolve(__dirname, '../vrender/src/register.ts'),
    '@visactor/vrender/es/kits': path.resolve(__dirname, '../vrender/src/kits.ts'),
    '@visactor/vrender-animate': path.resolve(__dirname, '../vrender-animate/src/index.ts')
  }
});
