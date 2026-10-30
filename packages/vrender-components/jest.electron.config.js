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
    '^@visactor/vrender/es/core$': path.resolve(__dirname, '../vrender/src/index.ts'),
    '^@visactor/vrender/es/register$': path.resolve(__dirname, '../vrender/src/register.ts'),
    '^@visactor/vrender/es/kits$': path.resolve(__dirname, '../vrender/src/kits.ts'),
    ...require('../../share/jest-config/source-module-name-mapper')
  }
});

// 真实 Canvas fixture 同时用于浏览器和 Electron，需转换其中的 ES module JavaScript。
module.exports.transform = { '^.+\\.[tj]sx?$': 'ts-jest' };
