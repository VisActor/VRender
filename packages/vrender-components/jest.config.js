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
      tsconfig: './tsconfig.test.json',
    }
  },
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['json-summary', 'lcov'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings'],
  moduleNameMapper: {
    '@visactor/vrender': path.resolve(__dirname, '../vrender/src/index.ts')
  }
};
