module.exports = {
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testTimeout: 30000,
  testRegex: '/__tests__/.*test\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  preset: 'ts-jest',
  silent: true,
  globals: {
    'ts-jest': {
      tsconfig: {
        resolveJsonModule: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        module: 'ESNext'
      }
    },
    __DEV__: true
  },
  setupFiles: ['./setup-mock.js'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['json-summary', 'lcov', 'text'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings'],
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
