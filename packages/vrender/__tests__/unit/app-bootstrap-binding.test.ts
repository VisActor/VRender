/**
 * @jest-environment node
 */

declare const require: any;
export {};

describe('app-scoped bootstrap binding context', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('acquireSharedVRenderApp keeps runtime renderer bindings after legacy graphic registration', () => {
    jest.isolateModules(() => {
      const { registerLine } = require('@visactor/vrender-kits/register/register-line');

      registerLine();

      const { acquireSharedVRenderApp } = require('../../src/entries/shared');
      const handle = acquireSharedVRenderApp({ env: 'browser', key: Symbol('legacy-line-first') });

      expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
      expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

      handle.release();
    });
  });

  test('acquireSharedVRenderApp bootstraps browser defaults without legacy renderer gaps', () => {
    jest.isolateModules(() => {
      const { acquireSharedVRenderApp } = require('../../src/entries/shared');
      const handle = acquireSharedVRenderApp({ env: 'browser', key: Symbol('browser-defaults') });

      expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
      expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

      handle.release();
    });
  });

  test.each([
    ['area', '@visactor/vrender-kits/register/register-area', 'registerArea'],
    ['circle', '@visactor/vrender-kits/register/register-circle', 'registerCircle'],
    ['glyph', '@visactor/vrender-kits/register/register-glyph', 'registerGlyph']
  ])(
    'acquireSharedVRenderApp keeps runtime %s renderer binding after legacy registration',
    (_, moduleName, exportName) => {
      jest.isolateModules(() => {
        const register = require(moduleName)[exportName];

        register();

        const { acquireSharedVRenderApp } = require('../../src/entries/shared');
        const handle = acquireSharedVRenderApp({ env: 'browser', key: Symbol(`${exportName}-first`) });

        expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
        expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

        handle.release();
      });
    }
  );

  test.each([
    ['line', '@visactor/vrender-kits/register/register-line', 'registerLine'],
    ['area', '@visactor/vrender-kits/register/register-area', 'registerArea'],
    ['circle', '@visactor/vrender-kits/register/register-circle', 'registerCircle'],
    ['glyph', '@visactor/vrender-kits/register/register-glyph', 'registerGlyph']
  ])(
    'acquireSharedBrowserLiteVRenderApp keeps runtime %s renderer binding after legacy registration',
    (_, moduleName, exportName) => {
      jest.isolateModules(() => {
        const register = require(moduleName)[exportName];

        register();

        const { acquireSharedBrowserLiteVRenderApp } = require('../../src/entries/shared-browser-lite');
        const handle = acquireSharedBrowserLiteVRenderApp({ env: 'browser', key: Symbol(`${exportName}-lite-first`) });

        expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
        expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

        handle.release();
      });
    }
  );
});
