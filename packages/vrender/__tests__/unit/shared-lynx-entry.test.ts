/**
 * @jest-environment node
 */

declare const require: any;
export {};

const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');

describe('Lynx-condition shared app entry', () => {
  beforeEach(() => {
    jest.resetModules();
    delete (globalThis as any)[SHARED_APP_REGISTRY_KEY];
  });

  test('creates and shares a Lynx app without loading another environment entry', () => {
    jest.isolateModules(() => {
      const release = jest.fn();
      const lynxApp = { env: 'lynx', release };
      const createLynxVRenderApp = jest.fn(() => lynxApp);

      jest.doMock('../../src/entries/lynx', () => ({ createLynxVRenderApp }));

      const { acquireSharedVRenderApp } = require('../../src/entries/shared-lynx');
      const first = acquireSharedVRenderApp({ env: 'lynx', envParams: { pixelRatio: 2 } });
      const second = acquireSharedVRenderApp({ env: 'lynx', envParams: { pixelRatio: 3 } });

      expect(first.app).toBe(lynxApp);
      expect(second.app).toBe(lynxApp);
      expect(first.env).toBe('lynx');
      expect(createLynxVRenderApp).toHaveBeenCalledTimes(1);
      expect(createLynxVRenderApp).toHaveBeenCalledWith({ envParams: { pixelRatio: 2 } });

      first.release();
      expect(release).not.toHaveBeenCalled();
      second.release();
      expect(release).toHaveBeenCalledTimes(1);
    });
  });

  test('defaults to Lynx for the Lynx build condition', () => {
    jest.isolateModules(() => {
      const lynxApp = { env: 'lynx', release: jest.fn() };
      const createLynxVRenderApp = jest.fn(() => lynxApp);

      jest.doMock('../../src/entries/lynx', () => ({ createLynxVRenderApp }));

      const { acquireSharedVRenderApp } = require('../../src/entries/shared-lynx');
      const handle = acquireSharedVRenderApp();

      expect(handle.env).toBe('lynx');
      expect(handle.app).toBe(lynxApp);
      handle.release();
    });
  });
});
