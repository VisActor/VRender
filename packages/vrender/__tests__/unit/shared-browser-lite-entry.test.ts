/**
 * @jest-environment node
 */

declare const require: any;
export {};

const emptyArray = (): never[] => [];

describe('lite browser shared app entry', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('loads only the lite browser runtime surface', () => {
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
      jest.doMock('@visactor/vrender-kits/installers/browser-lite', () => ({
        installBrowserLiteEnvToApp: jest.fn(),
        installBrowserLitePickersToApp: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits/installers/graphics-lite', () => ({
        installLiteGraphicsToApp: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits/picker/contributions/constants', () => ({
        CanvasPickerContribution: 'CanvasPickerContribution'
      }));
      jest.doMock('@visactor/vrender-animate/register', () => ({
        registerAnimate: jest.fn()
      }));

      const allowedRegisterMocks = {
        area: 'registerArea',
        circle: 'registerCircle',
        glyph: 'registerGlyph',
        group: 'registerGroup',
        line: 'registerLine',
        rect: 'registerRect',
        shadowRoot: 'registerShadowRoot',
        symbol: 'registerSymbol',
        text: 'registerText',
        wraptext: 'registerWrapText'
      };

      Object.entries(allowedRegisterMocks).forEach(([name, exportName]) => {
        jest.doMock(`@visactor/vrender-kits/register/register-${name}`, () => ({
          [exportName]: jest.fn()
        }));
      });

      [
        '@visactor/vrender-kits/installers/graphics',
        '@visactor/vrender-kits/installers/browser',
        '@visactor/vrender-kits/env/node',
        '@visactor/vrender-kits/env/wx',
        '@visactor/vrender-kits/env/lynx',
        '@visactor/vrender-kits/env/harmony',
        '@visactor/vrender-kits/env/browser',
        '@visactor/vrender-kits/register/register-arc',
        '@visactor/vrender-kits/register/register-arc3d',
        '@visactor/vrender-kits/register/register-gif',
        '@visactor/vrender-kits/register/register-image',
        '@visactor/vrender-kits/register/register-path',
        '@visactor/vrender-kits/register/register-polygon',
        '@visactor/vrender-kits/register/register-pyramid3d',
        '@visactor/vrender-kits/register/register-rect3d',
        '@visactor/vrender-kits/register/register-richtext',
        '@visactor/vrender-kits/register/register-star',
        '@visactor/vrender-animate/custom/register'
      ].forEach(moduleName => {
        jest.doMock(moduleName, () => {
          throw new Error(`${moduleName} should not be loaded by shared-browser-lite`);
        });
      });

      const { acquireSharedBrowserLiteVRenderApp } = require('../../src/entries/shared-browser-lite');
      const handle = acquireSharedBrowserLiteVRenderApp({ env: 'browser', key: Symbol('browser-lite') });

      expect(createBrowserApp).toHaveBeenCalledTimes(1);
      expect(createBrowserApp).toHaveBeenCalledWith({});
      expect(handle.env).toBe('browser');
      handle.release();
    });
  });
});
