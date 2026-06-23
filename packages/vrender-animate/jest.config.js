const path = require('path');
const { createStablePackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createStablePackageJestConfig({
  environment: 'node',
  testRegex: '/__tests__/.*test\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  setupFiles: ['./setup-mock.js'],
  testPathIgnorePatterns: ['__tests__/electron'],
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
    '^@visactor/vrender-core/event/constant$': path.resolve(__dirname, '../vrender-core/src/event/public-constant.ts'),
    '^@visactor/vrender-core/render/draw-interceptor$': path.resolve(
      __dirname,
      '../vrender-core/src/render/contributions/render/draw-interceptor.ts'
    ),
    '^@visactor/vrender-core/render/symbol$': path.resolve(
      __dirname,
      '../vrender-core/src/render/contributions/render/symbol.ts'
    ),
    '^@visactor/vrender-core/(.*)$': path.resolve(__dirname, '../vrender-core/src/$1'),
    '^@visactor/vrender-core$': path.resolve(__dirname, '../vrender-core/src/index.ts')
  }
});
