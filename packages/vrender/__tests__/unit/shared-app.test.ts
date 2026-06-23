/**
 * @jest-environment node
 */

declare const require: any;
export {};

const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');

function createMockApp(id: string) {
  const releaseMock = jest.fn();
  return {
    id,
    released: false,
    release: releaseMock,
    releaseMock
  };
}

function mockEntryCreators(creators: Record<string, jest.Mock>) {
  jest.doMock('../../src/entries/browser', () => ({
    createBrowserVRenderApp: creators.createBrowserVRenderApp ?? jest.fn()
  }));
  jest.doMock('../../src/entries/node', () => ({
    createNodeVRenderApp: creators.createNodeVRenderApp ?? jest.fn()
  }));
  jest.doMock('../../src/entries/miniapp', () => ({
    createTaroVRenderApp: creators.createTaroVRenderApp ?? jest.fn(),
    createFeishuVRenderApp: creators.createFeishuVRenderApp ?? jest.fn(),
    createTTVRenderApp: creators.createTTVRenderApp ?? jest.fn(),
    createWxVRenderApp: creators.createWxVRenderApp ?? jest.fn(),
    createLynxVRenderApp: creators.createLynxVRenderApp ?? jest.fn(),
    createHarmonyVRenderApp: creators.createHarmonyVRenderApp ?? jest.fn()
  }));
}

describe('shared VRender app entries', () => {
  beforeEach(() => {
    jest.resetModules();
    delete (globalThis as any)[SHARED_APP_REGISTRY_KEY];
  });

  test('acquires the same app for the same env and key until all handles are released', () => {
    jest.isolateModules(() => {
      const app = createMockApp('lynx-app');
      const createLynxVRenderApp = jest.fn(() => app);
      mockEntryCreators({ createLynxVRenderApp });

      const { acquireSharedVRenderApp, getSharedVRenderApp } = require('../../src/entries/shared');
      const first = acquireSharedVRenderApp({
        env: 'lynx',
        key: 'main',
        envParams: { pixelRatio: 2 }
      });
      const second = acquireSharedVRenderApp({
        env: 'lynx',
        key: 'main',
        envParams: { pixelRatio: 3 }
      });

      expect(first.app).toBe(app);
      expect(second.app).toBe(app);
      expect(getSharedVRenderApp('lynx', 'main')).toBe(app);
      expect(createLynxVRenderApp).toHaveBeenCalledTimes(1);
      expect(createLynxVRenderApp).toHaveBeenCalledWith({ envParams: { pixelRatio: 2 } });

      first.release();
      expect(app.releaseMock).not.toHaveBeenCalled();
      expect(getSharedVRenderApp('lynx', 'main')).toBe(app);

      second.release();
      expect(app.releaseMock).toHaveBeenCalledTimes(1);
      expect(getSharedVRenderApp('lynx', 'main')).toBeNull();
    });
  });

  test('keeps different shared keys isolated', () => {
    jest.isolateModules(() => {
      const firstApp = createMockApp('first-node-app');
      const secondApp = createMockApp('second-node-app');
      const createNodeVRenderApp = jest.fn().mockReturnValueOnce(firstApp).mockReturnValueOnce(secondApp);
      mockEntryCreators({ createNodeVRenderApp });

      const { acquireSharedVRenderApp } = require('../../src/entries/shared');
      const first = acquireSharedVRenderApp({ env: 'node', key: 'chart', envParams: {} });
      const second = acquireSharedVRenderApp({ env: 'node', key: 'table', envParams: {} });

      expect(first.app).toBe(firstApp);
      expect(second.app).toBe(secondApp);
      expect(createNodeVRenderApp).toHaveBeenCalledTimes(2);

      first.release();
      expect(firstApp.releaseMock).toHaveBeenCalledTimes(1);
      expect(secondApp.releaseMock).not.toHaveBeenCalled();

      second.release();
      expect(secondApp.releaseMock).toHaveBeenCalledTimes(1);
    });
  });

  test('recreates the shared app after release', () => {
    jest.isolateModules(() => {
      const firstApp = createMockApp('first-browser-app');
      const secondApp = createMockApp('second-browser-app');
      const createBrowserVRenderApp = jest.fn().mockReturnValueOnce(firstApp).mockReturnValueOnce(secondApp);
      mockEntryCreators({ createBrowserVRenderApp });

      const { acquireSharedVRenderApp } = require('../../src/entries/shared');
      const first = acquireSharedVRenderApp({ env: 'browser' });
      first.release();
      const second = acquireSharedVRenderApp({ env: 'browser' });

      expect(first.app).toBe(firstApp);
      expect(second.app).toBe(secondApp);
      expect(firstApp.releaseMock).toHaveBeenCalledTimes(1);
      expect(secondApp.releaseMock).not.toHaveBeenCalled();
    });
  });

  test('clears the registry when the shared app is released directly', () => {
    jest.isolateModules(() => {
      const app = createMockApp('wx-app');
      const createWxVRenderApp = jest.fn(() => app);
      mockEntryCreators({ createWxVRenderApp });

      const { acquireSharedVRenderApp, getSharedVRenderApp } = require('../../src/entries/shared');
      const handle = acquireSharedVRenderApp({ env: 'wx' });
      handle.app.release();

      expect(app.releaseMock).toHaveBeenCalledTimes(1);
      expect(getSharedVRenderApp('wx')).toBeNull();

      handle.release();
      expect(app.releaseMock).toHaveBeenCalledTimes(1);
    });
  });

  test('releaseSharedVRenderApp force releases an active shared app', () => {
    jest.isolateModules(() => {
      const app = createMockApp('harmony-app');
      const createHarmonyVRenderApp = jest.fn(() => app);
      mockEntryCreators({ createHarmonyVRenderApp });

      const {
        acquireSharedVRenderApp,
        getSharedVRenderApp,
        releaseSharedVRenderApp
      } = require('../../src/entries/shared');
      const handle = acquireSharedVRenderApp({ env: 'harmony', key: 'host' });

      releaseSharedVRenderApp('harmony', 'host');

      expect(app.releaseMock).toHaveBeenCalledTimes(1);
      expect(getSharedVRenderApp('harmony', 'host')).toBeNull();

      handle.release();
      expect(app.releaseMock).toHaveBeenCalledTimes(1);
    });
  });
});
