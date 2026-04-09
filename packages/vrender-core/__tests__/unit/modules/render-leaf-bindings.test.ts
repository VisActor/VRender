export {};
declare const require: any;

describe('core render leaf bindings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindArcRenderModule should bind renderer and provider without ContainerModule', () => {
    jest.isolateModules(() => {
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toSelf: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toService: jest.fn()
      }));
      const bindContributionProvider = jest.fn();

      jest.doMock('../../../src/common/contribution-provider', () => ({
        bindContributionProvider
      }));
      jest.doMock('../../../src/render/contributions/render/arc-render', () => ({
        DefaultCanvasArcRender: class DefaultCanvasArcRender {}
      }));
      jest.doMock('../../../src/render/contributions/render/contributions/constants', () => ({
        ArcRenderContribution: 'ArcRenderContribution'
      }));
      jest.doMock('../../../src/render/contributions/render/symbol', () => ({
        ArcRender: 'ArcRender',
        GraphicRender: 'GraphicRender'
      }));

      const mod = require('../../../src/render/contributions/render/arc-module');
      mod.bindArcRenderModule({ bind });

      expect(bind).toHaveBeenCalled();
      expect(bindContributionProvider).toHaveBeenCalledTimes(1);
    });
  });

  test('bindRectRenderModule should bind renderer and provider without ContainerModule', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toSelf: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));
      const bindContributionProvider = jest.fn();
      const createContributionProvider = jest.fn();

      jest.doMock('../../../src/common/contribution-provider', () => ({
        bindContributionProvider,
        createContributionProvider
      }));
      jest.doMock('../../../src/render/contributions/render/rect-render', () => ({
        DefaultCanvasRectRender: class DefaultCanvasRectRender {}
      }));
      jest.doMock('../../../src/render/contributions/render/contributions/constants', () => ({
        RectRenderContribution: 'RectRenderContribution'
      }));
      jest.doMock('../../../src/render/contributions/render/symbol', () => ({
        ArcRender: 'ArcRender',
        RectRender: 'RectRender',
        GraphicRender: 'GraphicRender'
      }));

      const mod = require('../../../src/render/contributions/render/rect-module');
      mod.bindRectRenderModule({ bind });

      expect(bind).toHaveBeenCalled();
      expect(bindContributionProvider).toHaveBeenCalledTimes(1);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      const [rectFactory] = (toDynamicValue.mock.calls as any[]).map(
        args => args[0] as (ctx: { container: any }) => unknown
      );
      rectFactory({ container: { getAll: jest.fn(() => []), isBound: jest.fn(() => false) } });
      expect(createContributionProvider).toHaveBeenCalledWith('RectRenderContribution', expect.anything());
    });
  });

  test('bindStarRenderModule should bind renderer through explicit factory', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));
      const createContributionProvider = jest.fn();

      jest.doMock('../../../src/common/contribution-provider', () => ({
        createContributionProvider
      }));
      jest.doMock('../../../src/render/contributions/render/star-render', () => ({
        DefaultCanvasStarRender: class DefaultCanvasStarRender {}
      }));
      jest.doMock('../../../src/render/contributions/render/contributions/constants', () => ({
        StarRenderContribution: 'StarRenderContribution'
      }));
      jest.doMock('../../../src/render/contributions/render/symbol', () => ({
        GraphicRender: 'GraphicRender',
        StarRender: 'StarRender'
      }));

      const mod = require('../../../src/render/contributions/render/star-module');
      mod.bindStarRenderModule({ bind });

      expect(bind).toHaveBeenCalled();
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      const [starFactory] = (toDynamicValue.mock.calls as any[]).map(
        args => args[0] as (ctx: { container: any }) => unknown
      );
      starFactory({ container: { getAll: jest.fn(() => []), isBound: jest.fn(() => false) } });
      expect(createContributionProvider).toHaveBeenCalledWith('StarRenderContribution', expect.anything());
    });
  });
});
