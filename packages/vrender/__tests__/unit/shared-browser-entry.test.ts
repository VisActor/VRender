/**
 * @jest-environment node
 */

declare const require: any;
export {};

const emptyArray = (): never[] => [];

describe('browser-only shared app entry', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('does not load non-browser env, full custom animate, or gif modules', () => {
    jest.isolateModules(() => {
      const legacyBindingContextMock = { getAll: jest.fn(emptyArray) };
      const createBrowserApp = jest.fn(() => ({
        registry: {
          renderer: { getAll: jest.fn(emptyArray), clear: jest.fn(), register: jest.fn() },
          picker: { getAll: jest.fn(emptyArray), clear: jest.fn(), register: jest.fn() }
        },
        release: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp,
        getLegacyBindingContext: jest.fn(() => legacyBindingContextMock),
        GraphicRender: 'GraphicRender',
        registerDirectionalLight: jest.fn(),
        registerFlexLayoutPlugin: jest.fn(),
        registerHtmlAttributePlugin: jest.fn(),
        registerOrthoCamera: jest.fn(),
        registerReactAttributePlugin: jest.fn(),
        registerViewTransform3dPlugin: jest.fn()
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
        '@visactor/vrender-kits/env/lynx',
        '@visactor/vrender-kits/env/harmony',
        '@visactor/vrender-kits/env/browser',
        '@visactor/vrender-kits/register/register-gif',
        '@visactor/vrender-animate/custom/register'
      ].forEach(moduleName => {
        jest.doMock(moduleName, () => {
          throw new Error(`${moduleName} should not be loaded by shared-browser`);
        });
      });

      const { acquireSharedBrowserVRenderApp } = require('../../src/entries/shared-browser');
      const handle = acquireSharedBrowserVRenderApp({ env: 'browser', key: Symbol('browser-only') });

      expect(createBrowserApp).toHaveBeenCalledTimes(1);
      expect(createBrowserApp).toHaveBeenCalledWith({});
      expect(handle.env).toBe('browser');
      handle.release();
    });
  });
});
