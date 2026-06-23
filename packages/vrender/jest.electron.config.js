const path = require('path');
const { createElectronPackageJestConfig } = require('../../share/jest-config/create-package-config');

module.exports = createElectronPackageJestConfig({
  rootDir: __dirname,
  testRegex: '/__tests__/.*test\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  setupFiles: ['./setup-mock.js'],
  tsconfig: './tsconfig.test.json',
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings'],
  testPathIgnorePatterns: ['__tests__/browser'],
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
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@visactor/vrender-kits/(.*)$': path.resolve(__dirname, '../vrender-kits/src/$1'),
    '^@visactor/vrender-kits$': path.resolve(__dirname, '../vrender-kits/src/index.ts'),
    '^@visactor/vrender-animate/(.*)$': path.resolve(__dirname, '../vrender-animate/src/$1'),
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
    '^@visactor/vrender-core$': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '^@visactor/vrender-animate$': path.resolve(__dirname, '../vrender-animate/src/index.ts'),
    '^@visactor/vrender-components$': path.resolve(__dirname, '../vrender-components/src/index.ts')
  }
});
