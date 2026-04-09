declare let require: any;

describe('env-check', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  test('env override has priority', () => {
    jest.isolateModules(() => {
      const app = { global: { env: 'browser' as any } };
      jest.doMock('../../src/application', () => ({ application: app }));

      const { isBrowserEnv, isNodeEnv, getCurrentEnv } = require('../../src/env-check');

      expect(isBrowserEnv()).toBe(true);
      expect(isNodeEnv()).toBe(false);
      expect(getCurrentEnv()).toBe('browser');

      app.global.env = 'node';
      expect(isBrowserEnv()).toBe(false);
      expect(isNodeEnv()).toBe(true);
      expect(getCurrentEnv()).toBe('node');

      app.global.env = undefined;
    });
  });

  test('falls back to runtime detection and handles errors', () => {
    jest.isolateModules(() => {
      const app = { global: { env: undefined as any } };
      jest.doMock('../../src/application', () => ({ application: app }));

      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('boom');
      });

      const { isBrowserEnv, isNodeEnv, getCurrentEnv } = require('../../src/env-check');

      expect(isBrowserEnv()).toBe(false);
      expect(isNodeEnv()).toBe(true);
      expect(getCurrentEnv()).toBe('node');
    });
  });
});
