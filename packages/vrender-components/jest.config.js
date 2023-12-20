const path = require('path');

module.exports = {
  preset: 'ts-jest',
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testRegex: '/__tests__/.*\\.test\\.(js|ts)$',
  silent: true,
  globals: {
    'ts-jest': {
      resolveJsonModule: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      module: 'ESNext',
      tsconfig: './tsconfig.test.json'
    }
  },
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!**/type/**'],
  coverageReporters: ['json-summary', 'lcov', 'text'],
  setupFiles: ['./setup-mock.js'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings', 'type.ts'],
  moduleNameMapper: {
    '@visactor/vrender-kits': path.resolve(__dirname, '../vrender-kits/src/index.ts'),
    '@visactor/vrender-core': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '@visactor/vrender/es/core': path.resolve(__dirname, '../vrender/src/index.ts'),
    '@visactor/vrender/es/register': path.resolve(__dirname, '../vrender/src/register.ts'),
    '@visactor/vrender/es/kits': path.resolve(__dirname, '../vrender/src/kits.ts')
  }
};
