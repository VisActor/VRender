declare const require: any;
export {};

describe('vrender entry', () => {
  test('should not run the legacy bootstrap pipeline on import', () => {
    const registerGifImage = jest.fn();
    const bootstrapLegacyVRenderRuntime = jest.fn();

    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => ({
        isBrowserEnv: () => false,
        isNodeEnv: () => false,
        Direction: { Horizontal: 'horizontal' },
        registerFlexLayoutPlugin: jest.fn(),
        registerViewTransform3dPlugin: jest.fn(),
        registerHtmlAttributePlugin: jest.fn(),
        registerReactAttributePlugin: jest.fn(),
        registerDirectionalLight: jest.fn(),
        registerOrthoCamera: jest.fn()
      }));
      jest.doMock('@visactor/vrender-kits', () => ({
        loadBrowserEnv: jest.fn(),
        loadNodeEnv: jest.fn(),
        registerArc: jest.fn(),
        registerArc3d: jest.fn(),
        registerArea: jest.fn(),
        registerCircle: jest.fn(),
        registerGlyph: jest.fn(),
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
        registerSymbol: jest.fn(),
        registerText: jest.fn(),
        registerWrapText: jest.fn(),
        registerStar: jest.fn(),
        registerGifImage
      }));
      jest.doMock('@visactor/vrender-animate', () => ({
        registerCustomAnimate: jest.fn(),
        registerAnimate: jest.fn()
      }));
      jest.doMock('@visactor/vrender-components', () => ({}));
      jest.doMock('../../src/entries', () => ({
        bootstrapLegacyVRenderRuntime,
        createBrowserVRenderApp: jest.fn(),
        createNodeVRenderApp: jest.fn()
      }));

      require('../../src/index');
    });

    expect(bootstrapLegacyVRenderRuntime).not.toHaveBeenCalled();
    expect(registerGifImage).not.toHaveBeenCalled();
  });

  test('should lazily create a browser app when legacy createStage is called', () => {
    jest.isolateModules(() => {
      const createStage = jest.fn(params => ({ id: 'stage', params }));
      const createBrowserVRenderApp = jest.fn(() => ({ createStage }));
      const createNodeVRenderApp = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        Direction: { Horizontal: 'horizontal' },
        isBrowserEnv: () => true,
        isNodeEnv: () => false
      }));
      jest.doMock('@visactor/vrender-kits', () => ({}));
      jest.doMock('@visactor/vrender-animate', () => ({ State: {} }));
      jest.doMock('@visactor/vrender-components', () => ({}));
      jest.doMock('../../src/entries', () => ({
        bootstrapLegacyVRenderRuntime: jest.fn(),
        createBrowserVRenderApp,
        createNodeVRenderApp
      }));

      const vrender = require('../../src/index');
      const params = { width: 100, height: 200 };

      expect(vrender.createStage(params)).toEqual({ id: 'stage', params });
      expect(vrender.createStage(params)).toEqual({ id: 'stage', params });
      expect(createBrowserVRenderApp).toHaveBeenCalledTimes(1);
      expect(createNodeVRenderApp).not.toHaveBeenCalled();
      expect(createStage).toHaveBeenCalledTimes(2);
      expect(createStage).toHaveBeenCalledWith(params);
    });
  });
});
