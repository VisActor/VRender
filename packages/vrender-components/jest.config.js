const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: path.resolve(__dirname, '../../share/jest-config/jest-environment-jsdom-26.js'),
  testEnvironmentOptions: {
    pretendToBeVisual: true
  },
  testRegex: '/__tests__/.*\\.test\\.(js|ts)$',
  silent: true,
  useStderr: false,
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
  setupFiles: [path.resolve(__dirname, '../../share/jest-config/setup-jsdom-canvas.js'), './setup-mock.js'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings', 'type.ts'],
  moduleNameMapper: {
    '@visactor/vrender-kits': path.resolve(__dirname, '../vrender-kits/src/index.ts'),
    '@visactor/vrender-core': path.resolve(__dirname, '../vrender-core/src/index.ts'),
    '@visactor/vrender/es/core': path.resolve(__dirname, '../vrender/src/index.ts'),
    '@visactor/vrender/es/register': path.resolve(__dirname, '../vrender/src/register.ts'),
    '@visactor/vrender/es/kits': path.resolve(__dirname, '../vrender/src/kits.ts'),
    '@visactor/vrender-animate': path.resolve(__dirname, '../vrender-animate/src/index.ts')
  }
};
