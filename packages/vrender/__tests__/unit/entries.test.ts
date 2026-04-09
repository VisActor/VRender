declare const require: any;
export {};

describe('vrender app-scoped entries', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('createBrowserVRenderApp should create a browser app and run the default browser bootstrap pipeline', () => {
    jest.isolateModules(() => {
      const app = { id: 'browser-app' };
      const createBrowserApp = jest.fn(() => app);
      const loadBrowserEnv = jest.fn();
      const registerGifImage = jest.fn();
      const registerAnimate = jest.fn();
      const registerCustomAnimate = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp,
        createNodeApp: jest.fn(),
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
        loadBrowserEnv,
        loadNodeEnv: jest.fn(),
        registerArc: jest.fn(),
        registerArc3d: jest.fn(),
        registerArea: jest.fn(),
        registerCircle: jest.fn(),
        registerGlyph: jest.fn(),
        registerGifImage,
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
        registerWrapText: jest.fn()
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate,
        registerCustomAnimate
      }));

      const { createBrowserVRenderApp } = require('../../src/entries');

      expect(createBrowserVRenderApp({ context: { tag: 'browser' } })).toBe(app);
      expect(createBrowserApp).toHaveBeenCalledWith({ context: { tag: 'browser' } });
      expect(loadBrowserEnv).toHaveBeenCalledWith();
      expect(registerGifImage).toHaveBeenCalledTimes(1);
      expect(registerCustomAnimate).toHaveBeenCalledTimes(1);
      expect(registerAnimate).toHaveBeenCalledTimes(1);
    });
  });

  test('createNodeVRenderApp should create a node app and run the default node bootstrap pipeline', () => {
    jest.isolateModules(() => {
      const app = { id: 'node-app' };
      const createNodeApp = jest.fn(() => app);
      const loadNodeEnv = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp: jest.fn(),
        createNodeApp,
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
        loadBrowserEnv: jest.fn(),
        loadNodeEnv,
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
        registerWrapText: jest.fn()
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate: jest.fn(),
        registerCustomAnimate: jest.fn()
      }));

      const { createNodeVRenderApp } = require('../../src/entries');

      expect(createNodeVRenderApp()).toBe(app);
      expect(createNodeApp).toHaveBeenCalledTimes(1);
      expect(loadNodeEnv).toHaveBeenCalledWith();
    });
  });

  test('bootstrapVRenderBrowserApp should only bootstrap the same app once', () => {
    jest.isolateModules(() => {
      const app = { id: 'browser-app' };
      const loadBrowserEnv = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        createBrowserApp: jest.fn(),
        createNodeApp: jest.fn(),
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
        loadBrowserEnv,
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
        registerWrapText: jest.fn()
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerAnimate: jest.fn(),
        registerCustomAnimate: jest.fn()
      }));

      const { bootstrapVRenderBrowserApp } = require('../../src/entries');

      expect(bootstrapVRenderBrowserApp(app)).toBe(app);
      expect(bootstrapVRenderBrowserApp(app)).toBe(app);
      expect(loadBrowserEnv).toHaveBeenCalledTimes(1);
    });
  });
});
