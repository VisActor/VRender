/**
 * @jest-environment node
 */

declare const require: any;
export {};

const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');

describe('vrender runtime contribution installer', () => {
  beforeEach(() => {
    jest.resetModules();
    delete (globalThis as any)[SHARED_APP_REGISTRY_KEY];
  });

  test('installs module state and refreshes existing shared apps when no app is passed', () => {
    jest.isolateModules(() => {
      const installCoreModule = jest.fn();
      jest.doMock('@visactor/vrender-core/entries/runtime-installer', () => ({
        installRuntimeContributionModule: installCoreModule
      }));

      const { acquireSharedApp } = require('../../src/entries/shared-registry');
      const firstApp = { id: 'first', released: false, release: jest.fn() };
      const secondApp = { id: 'second', released: false, release: jest.fn() };
      acquireSharedApp('browser', { key: 'first' }, () => firstApp);
      acquireSharedApp('node', { key: 'second' }, () => secondApp);

      const { installRuntimeContributionModule } = require('../../src/entries/runtime-contribution');
      const module = { registry: jest.fn() };
      const targets = ['graphic-renderer', 'draw-contribution'];

      installRuntimeContributionModule(module, { targets });

      expect(installCoreModule).toHaveBeenCalledTimes(2);
      expect(installCoreModule).toHaveBeenNthCalledWith(1, module, { targets, app: firstApp });
      expect(installCoreModule).toHaveBeenNthCalledWith(2, module, { targets, app: secondApp });
    });
  });

  test('installs only the explicit app when app is passed', () => {
    jest.isolateModules(() => {
      const installCoreModule = jest.fn();
      jest.doMock('@visactor/vrender-core/entries/runtime-installer', () => ({
        installRuntimeContributionModule: installCoreModule
      }));

      const { acquireSharedApp } = require('../../src/entries/shared-registry');
      const sharedApp = { id: 'shared', released: false, release: jest.fn() };
      acquireSharedApp('browser', { key: 'shared' }, () => sharedApp);

      const { installRuntimeContributionModule } = require('../../src/entries/runtime-contribution');
      const app = { id: 'explicit', released: false, release: jest.fn() };
      const module = { registry: jest.fn() };

      installRuntimeContributionModule(module, { app, targets: ['graphic-renderer'] });

      expect(installCoreModule).toHaveBeenCalledTimes(1);
      expect(installCoreModule).toHaveBeenNthCalledWith(1, module, { app, targets: ['graphic-renderer'] });
    });
  });

  test('defers app-less modules until future app creators finish default bootstrap', () => {
    jest.isolateModules(() => {
      const calls: string[] = [];
      const app = { id: 'future-app', released: false, release: jest.fn() };
      const createBrowserApp = jest.fn(() => app);
      const installCoreModule = jest.fn(() => {
        calls.push('install-pending');
      });
      const bootstrapVRenderBrowserApp = jest.fn((target: unknown) => {
        calls.push('bootstrap');
        return target;
      });

      jest.doMock('@visactor/vrender-core/entries/browser', () => ({
        createBrowserApp
      }));
      jest.doMock('@visactor/vrender-core/entries/runtime-installer', () => ({
        installRuntimeContributionModule: installCoreModule
      }));
      jest.doMock('../../src/entries/bootstrap', () => ({
        bootstrapVRenderBrowserApp
      }));

      const { installRuntimeContributionModule } = require('../../src/entries/runtime-contribution');
      const module = { registry: jest.fn() };

      installRuntimeContributionModule(module, { targets: ['graphic-renderer'] });
      expect(installCoreModule).not.toHaveBeenCalled();

      const { createBrowserVRenderApp } = require('../../src/entries/browser');
      expect(createBrowserVRenderApp()).toBe(app);

      expect(installCoreModule).toHaveBeenCalledTimes(1);
      expect(installCoreModule).toHaveBeenCalledWith(module, { targets: ['graphic-renderer'], app });
      expect(calls).toEqual(['bootstrap', 'install-pending']);
    });
  });
});
