/**
 * @jest-environment node
 */

declare const require: any;
export {};

const emptyArray = (): never[] => [];
const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');

describe('browser-condition shared app entry', () => {
  beforeEach(() => {
    jest.resetModules();
    delete (globalThis as any)[SHARED_APP_REGISTRY_KEY];
  });

  test('routes an explicit lynx env to the Lynx app without initializing the browser environment', () => {
    jest.isolateModules(() => {
      const lynxApp = {
        env: 'lynx',
        release: jest.fn()
      };
      const createBrowserApp = jest.fn(() => {
        throw new Error('the Lynx shared app must not initialize the browser environment');
      });
      const createLynxVRenderApp = jest.fn(() => lynxApp);

      jest.doMock('@visactor/vrender-core/entries/browser', () => ({
        BrowserEntry: class BrowserEntry {},
        createBrowserApp
      }));
      jest.doMock('../../src/entries/miniapp', () => ({ createLynxVRenderApp }));

      const { acquireSharedVRenderApp } = require('../../src/entries/shared-browser');
      const handle = (acquireSharedVRenderApp as any)(undefined, 'lynx');

      expect(handle.env).toBe('lynx');
      expect(handle.app).toBe(lynxApp);
      expect(createLynxVRenderApp).toHaveBeenCalledTimes(1);
      expect(createBrowserApp).not.toHaveBeenCalled();

      handle.release();
    });
  });

  test('keeps browser as the default and isolates browser and Lynx shared apps', () => {
    jest.isolateModules(() => {
      const legacyBindingContextMock = { getAll: jest.fn(emptyArray) };
      const browserApp = {
        env: 'browser',
        registry: {
          renderer: { getAll: jest.fn(emptyArray), clear: jest.fn(), register: jest.fn() },
          picker: { getAll: jest.fn(emptyArray), clear: jest.fn(), register: jest.fn() }
        },
        release: jest.fn()
      };
      const lynxApp = { env: 'lynx', release: jest.fn() };
      const createBrowserApp = jest.fn(() => browserApp);
      const createLynxVRenderApp = jest.fn(() => lynxApp);

      jest.doMock('@visactor/vrender-core/entries/browser', () => ({
        createBrowserApp
      }));
      jest.doMock('../../src/entries/miniapp', () => ({ createLynxVRenderApp }));
      jest.doMock('@visactor/vrender-core/legacy/bootstrap', () => ({
        getLegacyBindingContext: jest.fn(() => legacyBindingContextMock)
      }));
      jest.doMock('@visactor/vrender-core/render/symbol', () => ({
        GraphicRender: 'GraphicRender'
      }));
      jest.doMock('@visactor/vrender-core/plugin/3d', () => ({
        registerDirectionalLight: jest.fn(),
        registerOrthoCamera: jest.fn(),
        registerViewTransform3dPlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-core/plugin/attribute', () => ({
        registerHtmlAttributePlugin: jest.fn(),
        registerReactAttributePlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-core/plugin/flex-layout', () => ({
        registerFlexLayoutPlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits/installers/browser', () => ({
        installBrowserEnvToApp: jest.fn(),
        installBrowserPickersToApp: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits/installers/graphics', () => ({
        installStandardGraphicsToApp: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits/picker/contributions/constants', () => ({
        CanvasPickerContribution: 'CanvasPickerContribution'
      }));
      jest.doMock('@visactor/vrender-animate/register', () => ({
        registerAnimate: jest.fn()
      }));

      const registerMocks = {
        arc: 'registerArc',
        arc3d: 'registerArc3d',
        area: 'registerArea',
        circle: 'registerCircle',
        glyph: 'registerGlyph',
        group: 'registerGroup',
        image: 'registerImage',
        line: 'registerLine',
        path: 'registerPath',
        polygon: 'registerPolygon',
        pyramid3d: 'registerPyramid3d',
        rect: 'registerRect',
        rect3d: 'registerRect3d',
        richtext: 'registerRichtext',
        shadowRoot: 'registerShadowRoot',
        star: 'registerStar',
        symbol: 'registerSymbol',
        text: 'registerText',
        wraptext: 'registerWrapText'
      };

      Object.entries(registerMocks).forEach(([name, exportName]) => {
        jest.doMock(`@visactor/vrender-kits/register/register-${name}`, () => ({
          [exportName]: jest.fn()
        }));
      });

      [
        '@visactor/vrender-kits/env/node',
        '@visactor/vrender-kits/env/wx',
        '@visactor/vrender-kits/env/harmony',
        '@visactor/vrender-kits/env/browser',
        '@visactor/vrender-kits/register/register-gif',
        '@visactor/vrender-animate/custom/register'
      ].forEach(moduleName => {
        jest.doMock(moduleName, () => {
          throw new Error(`${moduleName} should not be loaded by shared-browser`);
        });
      });

      const { acquireSharedVRenderApp } = require('../../src/entries/shared-browser');
      const browserHandle = acquireSharedVRenderApp();
      const lynxHandle = (acquireSharedVRenderApp as any)(undefined, 'lynx');

      expect(createBrowserApp).toHaveBeenCalledTimes(1);
      expect(createBrowserApp).toHaveBeenCalledWith({});
      expect(browserHandle.env).toBe('browser');
      expect(browserHandle.app).toBe(browserApp);
      expect(lynxHandle.env).toBe('lynx');
      expect(lynxHandle.app).toBe(lynxApp);
      expect(browserHandle.app).not.toBe(lynxHandle.app);

      browserHandle.release();
      lynxHandle.release();
    });
  });
});
