const { createStablePackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createStablePackageJestConfig({
  environment: 'jsdom',
  testRegex: '/__tests__/.*\\.test\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['../../share/jest-config/browser-globals.js', './setup-mock.js'],
  testPathIgnorePatterns: ['__tests__/electron'],
  tsconfig: './tsconfig.test.json',
  collectCoverageFrom: ['src/**/*.ts', '!**/type/**'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings', 'type.ts'],
  moduleNameMapper: require('../../share/jest-config/source-module-name-mapper')
});
