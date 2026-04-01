module.exports = {
  testEnvironment: '../../share/jest-config/jest-environment-jsdom-26.js',
  testEnvironmentOptions: {
    pretendToBeVisual: true
  },
  testTimeout: 30000,
  testRegex: '/__tests__/.*test\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  preset: 'ts-jest',
  silent: true,
  useStderr: false,
  globals: {
    'ts-jest': {
      tsconfig: {
        resolveJsonModule: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        module: 'ESNext',
        sourceMap: true
      }
    },
    __DEV__: true
  },
  setupFiles: ['../../share/jest-config/setup-jsdom-canvas.js', './setup-mock.js'],
  verbose: true,
  coverageReporters: ['json-summary', 'lcov', 'text'],
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
  }
};
