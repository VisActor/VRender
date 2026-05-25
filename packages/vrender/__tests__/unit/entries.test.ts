/**
 * @jest-environment node
 */

declare const require: any;
export {};

describe('vrender app-scoped entries', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('createBrowserVRenderApp should create a browser app and run the default browser bootstrap pipeline', () => {
    jest.isolateModules(() => {
      const app = {
        id: 'browser-app',
        registry: {
          renderer: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() },
          picker: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() }
        }
      };
      const createBrowserApp = jest.fn(() => app);
      const installBrowserEnvToApp = jest.fn();
      const installBrowserPickersToApp = jest.fn();
      const installDefaultGraphicsToApp = jest.fn();
      const registerAnimate = jest.fn();
      const registerCustomAnimate = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp,
        createNodeApp: jest.fn(),
        getLegacyBindingContext: jest.fn(() => ({ getAll: jest.fn(() => []) })),
        GraphicRender: 'GraphicRender',
        isBrowserEnv: () => true,
        isNodeEnv: () => false,
        registerDirectionalLight: jest.fn(),
        registerFlexLayoutPlugin: jest.fn(),
        registerHtmlAttributePlugin: jest.fn(),
        registerOrthoCamera: jest.fn(),
        registerReactAttributePlugin: jest.fn(),
        registerViewTransform3dPlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits', () => ({
        CanvasPickerContribution: 'CanvasPickerContribution',
        loadBrowserEnv: jest.fn(),
        loadNodeEnv: jest.fn(),
        registerArc: jest.fn(),
        registerArc3d: jest.fn(),
        registerArea: jest.fn(),
        registerCircle: jest.fn(),
        registerGlyph: jest.fn(),
        registerGifImage: jest.fn(),
        registerGroup: jest.fn(),
        registerImage: jest.fn(),
        registerLine: jest.fn(),
        registerPath: jest.fn(),
        registerPolygon: jest.fn(),
        registerPyramid3d: jest.fn(),
        registerRect: jest.fn(),
        registerRect3d: jest.fn(),
        registerRichtext: jest.fn(),
        registerShadowRoot: jest.fn(),
        registerStar: jest.fn(),
        registerSymbol: jest.fn(),
        registerText: jest.fn(),
        registerWrapText: jest.fn(),
        installBrowserEnvToApp,
        installBrowserPickersToApp,
        installDefaultGraphicsToApp,
        installNodeEnvToApp: jest.fn(),
        installNodePickersToApp: jest.fn()
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate,
        registerCustomAnimate
      }));

      const { createBrowserVRenderApp } = require('../../src/entries');

      expect(createBrowserVRenderApp({ context: { tag: 'browser' } })).toBe(app);
      expect(createBrowserApp).toHaveBeenCalledWith({ context: { tag: 'browser' } });
      expect(installBrowserEnvToApp).toHaveBeenCalledWith(app);
      expect(installDefaultGraphicsToApp).toHaveBeenCalledWith(app);
      expect(installBrowserPickersToApp).toHaveBeenCalledWith(app);
      expect(registerCustomAnimate).toHaveBeenCalledTimes(1);
      expect(registerAnimate).toHaveBeenCalledTimes(1);
    });
  });

  test('createNodeVRenderApp should create a node app and run the default node bootstrap pipeline', () => {
    jest.isolateModules(() => {
      const app = {
        id: 'node-app',
        registry: {
          renderer: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() },
          picker: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() }
        }
      };
      const createNodeApp = jest.fn(() => app);
      const installNodeEnvToApp = jest.fn();
      const installNodePickersToApp = jest.fn();
      const installDefaultGraphicsToApp = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp: jest.fn(),
        createNodeApp,
        getLegacyBindingContext: jest.fn(() => ({ getAll: jest.fn(() => []) })),
        GraphicRender: 'GraphicRender',
        isBrowserEnv: () => false,
        isNodeEnv: () => true,
        registerDirectionalLight: jest.fn(),
        registerFlexLayoutPlugin: jest.fn(),
        registerHtmlAttributePlugin: jest.fn(),
        registerOrthoCamera: jest.fn(),
        registerReactAttributePlugin: jest.fn(),
        registerViewTransform3dPlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits', () => ({
        MathPickerContribution: 'MathPickerContribution',
        loadBrowserEnv: jest.fn(),
        loadNodeEnv: jest.fn(),
        registerArc: jest.fn(),
        registerArc3d: jest.fn(),
        registerArea: jest.fn(),
        registerCircle: jest.fn(),
        registerGlyph: jest.fn(),
        registerGifImage: jest.fn(),
        registerGroup: jest.fn(),
        registerImage: jest.fn(),
        registerLine: jest.fn(),
        registerPath: jest.fn(),
        registerPolygon: jest.fn(),
        registerPyramid3d: jest.fn(),
        registerRect: jest.fn(),
        registerRect3d: jest.fn(),
        registerRichtext: jest.fn(),
        registerShadowRoot: jest.fn(),
        registerStar: jest.fn(),
        registerSymbol: jest.fn(),
        registerText: jest.fn(),
        registerWrapText: jest.fn(),
        installBrowserEnvToApp: jest.fn(),
        installBrowserPickersToApp: jest.fn(),
        installDefaultGraphicsToApp,
        installNodeEnvToApp,
        installNodePickersToApp
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate: jest.fn(),
        registerCustomAnimate: jest.fn()
      }));

      const { createNodeVRenderApp } = require('../../src/entries');

      expect(createNodeVRenderApp()).toBe(app);
      expect(createNodeApp).toHaveBeenCalledTimes(1);
      expect(installNodeEnvToApp).toHaveBeenCalledWith(app);
      expect(installDefaultGraphicsToApp).toHaveBeenCalledWith(app);
      expect(installNodePickersToApp).toHaveBeenCalledWith(app);
    });
  });

  test.each([
    ['createTaroVRenderApp', 'installTaroEnvToApp', 'loadTaroEnv', 'taro'],
    ['createFeishuVRenderApp', 'installFeishuEnvToApp', 'loadFeishuEnv', 'feishu'],
    ['createTTVRenderApp', 'installTTEnvToApp', 'loadTTEnv', 'tt'],
    ['createWxVRenderApp', 'installWxEnvToApp', 'loadWxEnv', 'wx'],
    ['createLynxVRenderApp', 'installLynxEnvToApp', 'loadLynxEnv', 'lynx'],
    ['createHarmonyVRenderApp', 'installHarmonyEnvToApp', 'loadHarmonyEnv', 'harmony']
  ])(
    '%s should create a miniapp app and run the app-scoped bootstrap pipeline',
    (creatorName, installName, loadName, env) => {
      jest.isolateModules(() => {
        const app = {
          id: `${env}-app`,
          registry: {
            renderer: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() },
            picker: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() }
          }
        };
        const createMiniappApp = jest.fn(() => app);
        const installEnv = jest.fn();
        const loadEnv = jest.fn();
        const installDefaultGraphicsToApp = jest.fn();
        const installMathPickersToApp = jest.fn();
        const canvasFactory = jest.fn();
        const envParams = { pixelRatio: 2, canvasFactory };

        jest.doMock('@visactor/vrender-core', () => ({
          createBrowserApp: jest.fn(),
          createMiniappApp,
          createNodeApp: jest.fn(),
          getLegacyBindingContext: jest.fn(() => ({ getAll: jest.fn(() => []) })),
          GraphicRender: 'GraphicRender',
          isBrowserEnv: () => false,
          isNodeEnv: () => false,
          registerDirectionalLight: jest.fn(),
          registerFlexLayoutPlugin: jest.fn(),
          registerHtmlAttributePlugin: jest.fn(),
          registerOrthoCamera: jest.fn(),
          registerReactAttributePlugin: jest.fn(),
          registerViewTransform3dPlugin: jest.fn()
        }));
        jest.doMock('@visactor/vrender-kits', () => ({
          MathPickerContribution: 'MathPickerContribution',
          loadBrowserEnv: jest.fn(),
          loadNodeEnv: jest.fn(),
          loadTaroEnv: jest.fn(),
          loadFeishuEnv: jest.fn(),
          loadTTEnv: jest.fn(),
          loadWxEnv: jest.fn(),
          loadLynxEnv: jest.fn(),
          loadHarmonyEnv: jest.fn(),
          registerArc: jest.fn(),
          registerArc3d: jest.fn(),
          registerArea: jest.fn(),
          registerCircle: jest.fn(),
          registerGlyph: jest.fn(),
          registerGifImage: jest.fn(),
          registerGroup: jest.fn(),
          registerImage: jest.fn(),
          registerLine: jest.fn(),
          registerPath: jest.fn(),
          registerPolygon: jest.fn(),
          registerPyramid3d: jest.fn(),
          registerRect: jest.fn(),
          registerRect3d: jest.fn(),
          registerRichtext: jest.fn(),
          registerShadowRoot: jest.fn(),
          registerStar: jest.fn(),
          registerSymbol: jest.fn(),
          registerText: jest.fn(),
          registerWrapText: jest.fn(),
          installBrowserEnvToApp: jest.fn(),
          installBrowserPickersToApp: jest.fn(),
          installDefaultGraphicsToApp,
          installMathPickersToApp,
          installNodeEnvToApp: jest.fn(),
          installNodePickersToApp: jest.fn(),
          installTaroEnvToApp: jest.fn(),
          installFeishuEnvToApp: jest.fn(),
          installTTEnvToApp: jest.fn(),
          installWxEnvToApp: jest.fn(),
          installLynxEnvToApp: jest.fn(),
          installHarmonyEnvToApp: jest.fn(),
          [installName]: installEnv,
          [loadName]: loadEnv
        }));
        jest.doMock('@visactor/vrender-animate', () => ({
          registerAnimate: jest.fn(),
          registerCustomAnimate: jest.fn()
        }));

        const entries = require('../../src/entries');

        expect(entries[creatorName]({ context: { tag: env }, envParams })).toBe(app);
        expect(createMiniappApp).toHaveBeenCalledWith({ context: { tag: env } });
        expect(installEnv).toHaveBeenCalledWith(app, envParams);
        expect(installDefaultGraphicsToApp).toHaveBeenCalledWith(app);
        expect(installMathPickersToApp).toHaveBeenCalledWith(app);
        expect(loadEnv).toHaveBeenCalledTimes(1);
      });
    }
  );

  test('bootstrapVRenderBrowserApp should only bootstrap the same app once', () => {
    jest.isolateModules(() => {
      const app = {
        id: 'browser-app',
        registry: {
          renderer: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() },
          picker: { getAll: jest.fn(() => []), clear: jest.fn(), register: jest.fn() }
        }
      };
      const installBrowserEnvToApp = jest.fn();
      const installBrowserPickersToApp = jest.fn();
      const installDefaultGraphicsToApp = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp: jest.fn(),
        createNodeApp: jest.fn(),
        getLegacyBindingContext: jest.fn(() => ({ getAll: jest.fn(() => []) })),
        GraphicRender: 'GraphicRender',
        isBrowserEnv: () => true,
        isNodeEnv: () => false,
        registerDirectionalLight: jest.fn(),
        registerFlexLayoutPlugin: jest.fn(),
        registerHtmlAttributePlugin: jest.fn(),
        registerOrthoCamera: jest.fn(),
        registerReactAttributePlugin: jest.fn(),
        registerViewTransform3dPlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits', () => ({
        CanvasPickerContribution: 'CanvasPickerContribution',
        loadBrowserEnv: jest.fn(),
        loadNodeEnv: jest.fn(),
        registerArc: jest.fn(),
        registerArc3d: jest.fn(),
        registerArea: jest.fn(),
        registerCircle: jest.fn(),
        registerGlyph: jest.fn(),
        registerGifImage: jest.fn(),
        registerGroup: jest.fn(),
        registerImage: jest.fn(),
        registerLine: jest.fn(),
        registerPath: jest.fn(),
        registerPolygon: jest.fn(),
        registerPyramid3d: jest.fn(),
        registerRect: jest.fn(),
        registerRect3d: jest.fn(),
        registerRichtext: jest.fn(),
        registerShadowRoot: jest.fn(),
        registerStar: jest.fn(),
        registerSymbol: jest.fn(),
        registerText: jest.fn(),
        registerWrapText: jest.fn(),
        installBrowserEnvToApp,
        installBrowserPickersToApp,
        installDefaultGraphicsToApp,
        installNodeEnvToApp: jest.fn(),
        installNodePickersToApp: jest.fn()
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate: jest.fn(),
        registerCustomAnimate: jest.fn()
      }));

      const { bootstrapVRenderBrowserApp } = require('../../src/entries');

      expect(bootstrapVRenderBrowserApp(app)).toBe(app);
      expect(bootstrapVRenderBrowserApp(app)).toBe(app);
      expect(installBrowserEnvToApp).toHaveBeenCalledTimes(1);
      expect(installDefaultGraphicsToApp).toHaveBeenCalledTimes(1);
      expect(installBrowserPickersToApp).toHaveBeenCalledTimes(1);
    });
  });

  test('bootstrapVRenderBrowserApp should merge legacy renderer and picker registrations into app registries', () => {
    jest.isolateModules(() => {
      const legacyRenderer = {
        numberType: 11,
        type: 'rect',
        constructor: { name: 'DefaultCanvasRectRender' },
        reInit: jest.fn()
      };
      const legacyPicker = {
        numberType: 11,
        type: 'rect',
        constructor: { name: 'DefaultCanvasRectPicker' }
      };
      const appRenderer = {
        numberType: 5,
        constructor: { name: 'DefaultCanvasGroupRender' },
        reInit: jest.fn()
      };
      const appPicker = {
        numberType: 5,
        constructor: { name: 'DefaultCanvasGroupPicker' }
      };
      const rendererRegister = jest.fn();
      const pickerRegister = jest.fn();
      const app = {
        registry: {
          renderer: {
            getAll: jest.fn(() => [appRenderer]),
            clear: jest.fn(),
            register: rendererRegister
          },
          picker: {
            getAll: jest.fn(() => [appPicker]),
            clear: jest.fn(),
            register: pickerRegister
          }
        }
      };
      const installBrowserEnvToApp = jest.fn();
      const installBrowserPickersToApp = jest.fn();
      const installDefaultGraphicsToApp = jest.fn();
      const registerRect = jest.fn();
      const getAll = jest.fn((serviceIdentifier: string) => {
        if (serviceIdentifier === 'GraphicRender') {
          return [legacyRenderer];
        }
        if (serviceIdentifier === 'CanvasPickerContribution') {
          return [legacyPicker];
        }
        return [];
      });

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp: jest.fn(),
        createNodeApp: jest.fn(),
        getLegacyBindingContext: jest.fn(() => ({ getAll })),
        GraphicRender: 'GraphicRender',
        isBrowserEnv: () => true,
        isNodeEnv: () => false,
        registerDirectionalLight: jest.fn(),
        registerFlexLayoutPlugin: jest.fn(),
        registerHtmlAttributePlugin: jest.fn(),
        registerOrthoCamera: jest.fn(),
        registerReactAttributePlugin: jest.fn(),
        registerViewTransform3dPlugin: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits', () => ({
        CanvasPickerContribution: 'CanvasPickerContribution',
        installBrowserEnvToApp,
        installBrowserPickersToApp,
        installDefaultGraphicsToApp,
        installNodeEnvToApp: jest.fn(),
        installNodePickersToApp: jest.fn(),
        loadBrowserEnv: jest.fn(),
        loadNodeEnv: jest.fn(),
        registerArc: jest.fn(),
        registerArc3d: jest.fn(),
        registerArea: jest.fn(),
        registerCircle: jest.fn(),
        registerGlyph: jest.fn(),
        registerGifImage: jest.fn(),
        registerGroup: jest.fn(),
        registerImage: jest.fn(),
        registerLine: jest.fn(),
        registerPath: jest.fn(),
        registerPolygon: jest.fn(),
        registerPyramid3d: jest.fn(),
        registerRect,
        registerRect3d: jest.fn(),
        registerRichtext: jest.fn(),
        registerShadowRoot: jest.fn(),
        registerStar: jest.fn(),
        registerSymbol: jest.fn(),
        registerText: jest.fn(),
        registerWrapText: jest.fn()
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate: jest.fn(),
        registerCustomAnimate: jest.fn()
      }));

      const { bootstrapVRenderBrowserApp } = require('../../src/entries/bootstrap');

      expect(bootstrapVRenderBrowserApp(app)).toBe(app);
      expect(installBrowserEnvToApp).toHaveBeenCalledWith(app);
      expect(installDefaultGraphicsToApp).toHaveBeenCalledWith(app);
      expect(installBrowserPickersToApp).toHaveBeenCalledWith(app);
      expect(registerRect).toHaveBeenCalledTimes(1);
      expect(app.registry.renderer.clear).toHaveBeenCalledTimes(1);
      expect(app.registry.picker.clear).toHaveBeenCalledTimes(1);
      expect(rendererRegister).toHaveBeenCalledTimes(2);
      expect(pickerRegister).toHaveBeenCalledTimes(2);
      expect(rendererRegister).toHaveBeenCalledWith(
        expect.stringContaining('renderer:5:unknown:DefaultCanvasGroupRender'),
        appRenderer
      );
      expect(rendererRegister).toHaveBeenCalledWith(
        expect.stringContaining('renderer:11:rect:DefaultCanvasRectRender'),
        legacyRenderer
      );
      expect(pickerRegister).toHaveBeenCalledWith(
        expect.stringContaining('picker:5:unknown:DefaultCanvasGroupPicker'),
        appPicker
      );
      expect(pickerRegister).toHaveBeenCalledWith(
        expect.stringContaining('picker:11:rect:DefaultCanvasRectPicker'),
        legacyPicker
      );
      expect(legacyRenderer.reInit).toHaveBeenCalledTimes(1);
      expect(appRenderer.reInit).toHaveBeenCalledTimes(1);
    });
  });
});
