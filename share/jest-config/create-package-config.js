const path = require('path');

const DEFAULT_TS_JEST_CONFIG = {
  resolveJsonModule: true,
  esModuleInterop: true,
  experimentalDecorators: true,
  module: 'ESNext'
};

function resolveTsJestConfig(tsconfig) {
  if (!tsconfig) {
    return { ...DEFAULT_TS_JEST_CONFIG };
  }

  if (typeof tsconfig === 'string') {
    return {
      ...DEFAULT_TS_JEST_CONFIG,
      tsconfig
    };
  }

  return {
    ...DEFAULT_TS_JEST_CONFIG,
    ...tsconfig
  };
}

function createStablePackageJestConfig(options = {}) {
  const {
    environment = 'node',
    testTimeout = 30000,
    testRegex = '/__tests__/.*\\.test\\.(ts|tsx|js)$',
    moduleFileExtensions = ['ts', 'js', 'json'],
    setupFilesAfterEnv = [],
    setupFiles = [],
    tsconfig = './tsconfig.test.json',
    extraGlobals = {},
    silent = true,
    verbose = true,
    coverageReporters = ['json-summary', 'lcov', 'text'],
    coveragePathIgnorePatterns = [],
    testPathIgnorePatterns = [],
    collectCoverageFrom = [],
    moduleNameMapper,
    coverageThreshold
  } = options;

  const config = {
    preset: 'ts-jest',
    testEnvironment: environment,
    testTimeout,
    testRegex,
    moduleFileExtensions,
    setupFilesAfterEnv,
    silent,
    globals: {
      'ts-jest': resolveTsJestConfig(tsconfig),
      __DEV__: true,
      ...extraGlobals
    },
    setupFiles,
    verbose,
    coverageReporters,
    coveragePathIgnorePatterns,
    testPathIgnorePatterns,
    collectCoverageFrom
  };

  if (moduleNameMapper) {
    config.moduleNameMapper = moduleNameMapper;
  }

  if (coverageThreshold) {
    config.coverageThreshold = coverageThreshold;
  }

  return config;
}

function createElectronPackageJestConfig(options = {}) {
  const { rootDir, ...rest } = options;

  return {
    ...createStablePackageJestConfig({
      ...rest,
      environment: 'jest-electron/environment'
    }),
    runner: path.resolve(rootDir, '../../tools/jest-electron-stable/runner.js')
  };
}

module.exports = {
  createStablePackageJestConfig,
  createElectronPackageJestConfig
};
