describe('render module explicit bindings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindGifImageRenderContribution should bind once without ContainerModule wrapper', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        toDynamicValue,
        toSelf: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        GraphicRender: 'GraphicRender',
        ImageRenderContribution: 'ImageRenderContribution'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        createContributionProvider: jest.fn()
      }));
      jest.doMock('../../../src/render/contributions/canvas/gif-image-render', () => ({
        DefaultCanvasGifImageRender: class DefaultCanvasGifImageRender {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const mod = require('../../../src/render/contributions/canvas/gif-image-module');

      mod.bindGifImageRenderContribution({ bind });
      mod.bindGifImageRenderContribution({ bind });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('bindLottieRenderContribution should bind once without ContainerModule wrapper', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        toDynamicValue,
        toSelf: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        GraphicRender: 'GraphicRender',
        RectRenderContribution: 'RectRenderContribution'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        createContributionProvider: jest.fn()
      }));
      jest.doMock('../../../src/render/contributions/canvas/lottie-render', () => ({
        DefaultCanvasLottieRender: class DefaultCanvasLottieRender {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const mod = require('../../../src/render/contributions/canvas/lottie-module');

      mod.bindLottieRenderContribution({ bind });
      mod.bindLottieRenderContribution({ bind });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });
});
