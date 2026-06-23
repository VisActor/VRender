export {};
declare const require: any;

describe('core render leaf bindings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('graphic render modules should use explicit factories for renderer instances', () => {
    jest.isolateModules(() => {
      const calls: Array<{ service: any; method: string; target?: any }> = [];
      const bind = jest.fn((service: any) => {
        const chain: any = {
          to: jest.fn((target: any) => {
            calls.push({ service, method: 'to', target });
            return chain;
          }),
          toSelf: jest.fn(() => {
            calls.push({ service, method: 'toSelf' });
            return chain;
          }),
          toDynamicValue: jest.fn((target: any) => {
            calls.push({ service, method: 'toDynamicValue', target });
            return chain;
          }),
          toService: jest.fn((target: any) => {
            calls.push({ service, method: 'toService', target });
            return chain;
          }),
          inSingletonScope: jest.fn(() => chain),
          whenTargetNamed: jest.fn(() => chain)
        };
        return chain;
      });

      const modules = [
        require('../../../src/render/contributions/render/arc-module').bindArcRenderModule,
        require('../../../src/render/contributions/render/arc3d-module').bindArc3dRenderModule,
        require('../../../src/render/contributions/render/area-module').bindAreaRenderModule,
        require('../../../src/render/contributions/render/circle-module').bindCircleRenderModule,
        require('../../../src/render/contributions/render/glyph-module').bindGlyphRenderModule,
        require('../../../src/render/contributions/render/image-module').bindImageRenderModule,
        require('../../../src/render/contributions/render/line-module').bindLineRenderModule,
        require('../../../src/render/contributions/render/path-module').bindPathRenderModule,
        require('../../../src/render/contributions/render/polygon-module').bindPolygonRenderModule,
        require('../../../src/render/contributions/render/pyramid3d-module').bindPyramid3dRenderModule,
        require('../../../src/render/contributions/render/rect-module').bindRectRenderModule,
        require('../../../src/render/contributions/render/rect3d-module').bindRect3dRenderModule,
        require('../../../src/render/contributions/render/richtext-module').bindRichtextRenderModule,
        require('../../../src/render/contributions/render/star-module').bindStarRenderModule,
        require('../../../src/render/contributions/render/symbol-module').bindSymbolRenderModule,
        require('../../../src/render/contributions/render/text-module').bindTextRenderModule
      ];

      modules.forEach(bindModule => bindModule({ bind, isBound: jest.fn(() => false) }));

      const rendererConstructorBinding = calls.find(call => {
        const targetName = call.target?.name;
        const serviceName = call.service?.name;
        return (
          (call.method === 'to' && /^(DefaultCanvas|DefaultIncrementalCanvas).*Render$/.test(targetName)) ||
          (call.method === 'toSelf' && /^(DefaultCanvas|DefaultIncrementalCanvas).*Render$/.test(serviceName))
        );
      });

      expect(rendererConstructorBinding).toBeUndefined();
    });
  });

  test('bindArcRenderModule should bind renderer and provider without ContainerModule', () => {
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
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      const [arcFactory] = (toDynamicValue.mock.calls as any[]).map(
        args => args[0] as (ctx: { container: any }) => unknown
      );
      arcFactory({ container: { getAll: jest.fn(() => []), isBound: jest.fn(() => false) } });
      expect(createContributionProvider).toHaveBeenCalledWith('ArcRenderContribution', expect.anything());
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
      const bindContributionProvider = jest.fn();
      const createContributionProvider = jest.fn();

      jest.doMock('../../../src/common/contribution-provider', () => ({
        bindContributionProvider,
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
      expect(bindContributionProvider).toHaveBeenCalledTimes(1);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      const [starFactory] = (toDynamicValue.mock.calls as any[]).map(
        args => args[0] as (ctx: { container: any }) => unknown
      );
      starFactory({ container: { getAll: jest.fn(() => []), isBound: jest.fn(() => false) } });
      expect(createContributionProvider).toHaveBeenCalledWith('StarRenderContribution', expect.anything());
    });
  });
});
