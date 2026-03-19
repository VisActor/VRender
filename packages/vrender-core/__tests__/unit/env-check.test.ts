declare var require: any;

describe('env-check', () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    jest.resetModules();
    // @ts-ignore
    globalThis.document = originalDocument;
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

      // make document.createElement throw to hit catch branch
      const doc = globalThis.document as any;
      const originalCreateElement = doc.createElement;
      doc.createElement = () => {
        throw new Error('boom');
      };

      try {
        const { isBrowserEnv, isNodeEnv, getCurrentEnv } = require('../../src/env-check');

        expect(isBrowserEnv()).toBe(false);
        expect(isNodeEnv()).toBe(true);
        expect(getCurrentEnv()).toBe('node');
      } finally {
        doc.createElement = originalCreateElement;
      }
    });
  });
});
