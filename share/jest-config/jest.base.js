const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  silent: true,
  testMatch: [
    "**/__tests__/**/*.test.[jt]s"
  ],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        resolveJsonModule: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        module: 'ESNext'
        // ts-jest configuration goes here
      },
    ],
  },
  globals: {
    __DEV__: true,
  },
  verbose: false,

  collectCoverageFrom: ['**/*.{ts}', '!**/node_modules/**'],
  moduleNameMapper: {
    'd3-color': path.resolve(__dirname, './node_modules/d3-color/dist/d3-color.min.js'),
    'd3-array': path.resolve(__dirname, './node_modules/d3-array/dist/d3-array.min.js')
  }
};
