/**
 * @jest-environment node
 */

declare const require: any;
export {};

const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');

describe('browser-condition shared app entry', () => {
  beforeEach(() => {
    jest.resetModules();
    delete (globalThis as any)[SHARED_APP_REGISTRY_KEY];
  });

  test('creates the default browser app without loading Lynx', () => {
    jest.isolateModules(() => {
      const browserApp = { env: 'browser', release: jest.fn() };
      const createBrowserApp = jest.fn(() => browserApp);
      const bootstrapVRenderSharedBrowserApp = jest.fn((app: unknown) => app);
      const installPendingRuntimeContributionModulesToApp = jest.fn();

      jest.doMock('@visactor/vrender-core/entries/browser', () => ({ createBrowserApp }));
      jest.doMock('../../src/entries/bootstrap-browser', () => ({ bootstrapVRenderSharedBrowserApp }));
      jest.doMock('../../src/entries/runtime-contribution', () => ({ installPendingRuntimeContributionModulesToApp }));
      jest.doMock('../../src/entries/miniapp', () => {
        throw new Error('shared-browser must not load the multi-environment miniapp entry');
      });

      const { acquireSharedVRenderApp } = require('../../src/entries/shared-browser');
      const handle = acquireSharedVRenderApp();

      expect(handle.env).toBe('browser');
      expect(handle.app).toBe(browserApp);
      expect(createBrowserApp).toHaveBeenCalledWith({});
      expect(bootstrapVRenderSharedBrowserApp).toHaveBeenCalledWith(browserApp, undefined);
      expect(installPendingRuntimeContributionModulesToApp).toHaveBeenCalledWith(browserApp);

      handle.release();
    });
  });

  test('fails clearly when a non-browser environment resolves the browser condition', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core/entries/browser', () => ({ createBrowserApp: jest.fn() }));
      jest.doMock('../../src/entries/bootstrap-browser', () => ({ bootstrapVRenderSharedBrowserApp: jest.fn() }));
      jest.doMock('../../src/entries/runtime-contribution', () => ({
        installPendingRuntimeContributionModulesToApp: jest.fn()
      }));
      jest.doMock('../../src/entries/miniapp', () => ({ createLynxVRenderApp: jest.fn() }));

      const { acquireSharedVRenderApp } = require('../../src/entries/shared-browser');

      expect(() => acquireSharedVRenderApp({ env: 'lynx' } as any)).toThrow(/browser condition/i);
    });
  });
});
