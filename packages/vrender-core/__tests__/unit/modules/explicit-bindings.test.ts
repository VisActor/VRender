export {};
declare const require: any;

describe('core explicit bindings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindPickModules should bind picker services and interceptor providers without ContainerModule', () => {
    jest.isolateModules(() => {
      const bind = jest.fn(() => ({
        toSelf: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toService: jest.fn()
      }));
      const isBound = jest.fn((token: any) => token === 'PickerService');

      jest.doMock('../../../src/picker/constants', () => ({
        PickerService: 'PickerService',
        GlobalPickerService: 'GlobalPickerService',
        PickItemInterceptor: 'PickItemInterceptor',
        PickServiceInterceptor: 'PickServiceInterceptor'
      }));
      jest.doMock('../../../src/picker/global-picker-service', () => ({
        DefaultGlobalPickerService: class DefaultGlobalPickerService {}
      }));
      jest.doMock('../../../src/picker/pick-interceptor', () => ({
        Canvas3DPickItemInterceptor: class Canvas3DPickItemInterceptor {},
        InteractivePickItemInterceptorContribution: class InteractivePickItemInterceptorContribution {},
        ShadowPickServiceInterceptorContribution: class ShadowPickServiceInterceptorContribution {},
        ShadowRootPickItemInterceptorContribution: class ShadowRootPickItemInterceptorContribution {}
      }));
      const bindContributionProvider = jest.fn();
      jest.doMock('../../../src/common/contribution-provider', () => ({
        bindContributionProvider
      }));

      const mod = require('../../../src/picker/pick-modules');
      mod.bindPickModules({ bind, isBound });

      expect(bind).toHaveBeenCalled();
      expect(bindContributionProvider).toHaveBeenCalledTimes(2);
    });
  });

  test('bindPluginModules should bind plugin service and auto-enable provider without ContainerModule', () => {
    jest.isolateModules(() => {
      const bind = jest.fn(() => ({
        to: jest.fn()
      }));
      const bindContributionProviderNoSingletonScope = jest.fn();

      jest.doMock('../../../src/plugins/constants', () => ({
        PluginService: 'PluginService',
        AutoEnablePlugins: 'AutoEnablePlugins'
      }));
      jest.doMock('../../../src/plugins/plugin-service', () => ({
        DefaultPluginService: class DefaultPluginService {}
      }));
      jest.doMock('../../../src/common/contribution-provider', () => ({
        bindContributionProviderNoSingletonScope
      }));

      const mod = require('../../../src/plugins/plugin-modules');
      mod.bindPluginModules({ bind });

      expect(bind).toHaveBeenCalled();
      expect(bindContributionProviderNoSingletonScope).toHaveBeenCalledTimes(1);
    });
  });

  test('bindGraphicModules should bind graphic service and creator without ContainerModule', () => {
    jest.isolateModules(() => {
      const bind = jest.fn(() => ({
        to: jest.fn(),
        toConstantValue: jest.fn()
      }));

      jest.doMock('../../../src/graphic/graphic-service/graphic-service', () => ({
        DefaultGraphicService: class DefaultGraphicService {}
      }));
      jest.doMock('../../../src/graphic/constants', () => ({
        GraphicCreator: 'GraphicCreator',
        GraphicService: 'GraphicService'
      }));
      jest.doMock('../../../src/graphic/graphic-creator', () => ({
        graphicCreator: { id: 'graphicCreator' }
      }));

      const mod = require('../../../src/graphic/graphic-service/graphic-module');
      mod.bindGraphicModules({ bind });

      expect(bind).toHaveBeenCalled();
    });
  });

  test('bindCoreModules should bind core singletons and services without ContainerModule', () => {
    jest.isolateModules(() => {
      const toReturn = { inSingletonScope: jest.fn() };
      const toDynamicValue = jest.fn(() => toReturn);
      const bind = jest.fn(() => ({
        to: jest.fn(() => toReturn),
        toDynamicValue
      }));
      const createContributionProvider = jest.fn();

      jest.doMock('../../../src/core/global', () => ({
        DefaultGlobal: class DefaultGlobal {}
      }));
      jest.doMock('../../../src/core/graphic-utils', () => ({
        DefaultGraphicUtil: class DefaultGraphicUtil {},
        DefaultTransformUtil: class DefaultTransformUtil {}
      }));
      jest.doMock('../../../src/core/layer-service', () => ({
        DefaultLayerService: class DefaultLayerService {}
      }));
      jest.doMock('../../../src/core/window', () => ({
        DefaultWindow: class DefaultWindow {},
        VWindow: 'VWindow'
      }));
      jest.doMock('../../../src/core/constants', () => ({
        GraphicUtil: 'GraphicUtil',
        LayerService: 'LayerService',
        TransformUtil: 'TransformUtil'
      }));
      jest.doMock('../../../src/constants', () => ({
        EnvContribution: 'EnvContribution',
        VGlobal: 'VGlobal'
      }));
      jest.doMock('../../../src/core/contributions/textMeasure/textMeasure-contribution', () => ({
        TextMeasureContribution: 'TextMeasureContribution'
      }));
      jest.doMock('../../../src/common/contribution-provider', () => ({
        createContributionProvider
      }));

      const mod = require('../../../src/core/core-modules');
      mod.bindCoreModules({ bind });

      expect(bind).toHaveBeenCalled();
      expect(toDynamicValue).toHaveBeenCalledTimes(2);
      const container = { getAll: jest.fn(() => []), isBound: jest.fn(() => false) };
      const [globalFactory, graphicUtilFactory] = (toDynamicValue.mock.calls as any[]).map(
        args => args[0] as (ctx: { container: any }) => unknown
      );
      globalFactory({ container });
      graphicUtilFactory({ container });
      expect(createContributionProvider).toHaveBeenCalledTimes(2);
    });
  });

  test('bindRenderServiceModule should bind render service without ContainerModule', () => {
    jest.isolateModules(() => {
      const bind = jest.fn(() => ({
        to: jest.fn()
      }));

      jest.doMock('../../../src/render/render-service', () => ({
        DefaultRenderService: class DefaultRenderService {}
      }));
      jest.doMock('../../../src/render/constants', () => ({
        RenderService: 'RenderService'
      }));

      const mod = require('../../../src/render/render-modules');
      mod.bindRenderServiceModule({ bind });

      expect(bind).toHaveBeenCalled();
    });
  });

  test('core contribution binders should bind env/text/layer modules without ContainerModule', () => {
    jest.isolateModules(() => {
      const toReturn = { inSingletonScope: jest.fn() };
      const bind = jest.fn(() => ({
        to: jest.fn(() => toReturn),
        toSelf: jest.fn(() => toReturn),
        toService: jest.fn()
      }));
      const bindContributionProvider = jest.fn();

      jest.doMock('../../../src/common/contribution-provider', () => ({
        bindContributionProvider
      }));
      jest.doMock('../../../src/constants', () => ({
        EnvContribution: 'EnvContribution'
      }));
      jest.doMock('../../../src/core/contributions/textMeasure/textMeasure-contribution', () => ({
        DefaultTextMeasureContribution: class DefaultTextMeasureContribution {},
        TextMeasureContribution: 'TextMeasureContribution'
      }));
      jest.doMock('../../../src/core/constants', () => ({
        StaticLayerHandlerContribution: 'StaticLayerHandlerContribution'
      }));
      jest.doMock('../../../src/core/contributions/layerHandler/canvas2d-contribution', () => ({
        CanvasLayerHandlerContribution: class CanvasLayerHandlerContribution {}
      }));

      require('../../../src/core/contributions/env/modules').bindEnvContributionModules({ bind });
      require('../../../src/core/contributions/textMeasure/modules').bindTextMeasureModules({ bind });
      require('../../../src/core/contributions/layerHandler/modules').bindLayerHandlerModules({ bind });

      expect(bind).toHaveBeenCalled();
      expect(bindContributionProvider).toHaveBeenCalledTimes(2);
    });
  });

  test('bindRenderModules should bind render services, contributions and providers without ContainerModule', () => {
    jest.isolateModules(() => {
      const toReturn = { inSingletonScope: jest.fn() };
      const toDynamicValue = jest.fn(() => toReturn);
      const bind = jest.fn(() => ({
        to: jest.fn(() => toReturn),
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
      jest.doMock('../../../src/render/contributions/render/draw-contribution', () => ({
        DefaultDrawContribution: class DefaultDrawContribution {}
      }));
      jest.doMock('../../../src/render/contributions/render/group-render', () => ({
        DefaultCanvasGroupRender: class DefaultCanvasGroupRender {}
      }));
      jest.doMock('../../../src/render/contributions/render/incremental-draw-contribution', () => ({
        DefaultIncrementalDrawContribution: class DefaultIncrementalDrawContribution {}
      }));
      jest.doMock('../../../src/render/contributions/render/symbol', () => ({
        DrawContribution: 'DrawContribution',
        GraphicRender: 'GraphicRender',
        GroupRender: 'GroupRender',
        IncrementalDrawContribution: 'IncrementalDrawContribution',
        RenderSelector: 'RenderSelector'
      }));
      jest.doMock('../../../src/render/contributions/render/draw-interceptor', () => ({
        CommonDrawItemInterceptorContribution: class CommonDrawItemInterceptorContribution {},
        DrawItemInterceptor: 'DrawItemInterceptor'
      }));
      jest.doMock('../../../src/render/contributions/render/contributions/constants', () => ({
        GroupRenderContribution: 'GroupRenderContribution',
        InteractiveSubRenderContribution: 'InteractiveSubRenderContribution'
      }));
      jest.doMock('../../../src/render/contributions/render/contributions', () => ({
        DefaultBaseBackgroundRenderContribution: class DefaultBaseBackgroundRenderContribution {},
        DefaultBaseInteractiveRenderContribution: class DefaultBaseInteractiveRenderContribution {},
        DefaultBaseTextureRenderContribution: class DefaultBaseTextureRenderContribution {}
      }));

      const mod = require('../../../src/render/contributions/render/module');
      mod.bindRenderModules({ bind });

      expect(bind).toHaveBeenCalled();
      expect(bindContributionProvider).toHaveBeenCalled();
      expect(toDynamicValue).toHaveBeenCalledTimes(2);
      const [groupFactory, interactiveFactory] = (toDynamicValue.mock.calls as any[]).map(
        args => args[0] as (ctx: { container: any }) => unknown
      );
      const container = { getAll: jest.fn(() => []), isBound: jest.fn(() => false) };
      groupFactory({ container });
      interactiveFactory({ container });
      expect(createContributionProvider).toHaveBeenCalledWith('GroupRenderContribution', container);
      expect(createContributionProvider).toHaveBeenCalledWith('InteractiveSubRenderContribution', container);
    });
  });

  test('modules bootstrap should initialize application singletons without container.get', () => {
    jest.isolateModules(() => {
      const globalInstance = { id: 'global' };
      const graphicUtilInstance = { id: 'graphic-util' };
      const transformUtilInstance = { id: 'transform-util' };
      const graphicServiceInstance = { id: 'graphic-service' };
      const layerServiceInstance = { id: 'layer-service' };
      const canvasFactoryInstance = { id: 'canvas-factory' };
      const context2dFactoryInstance = { id: 'context2d-factory' };
      const legacyBindingContext = { id: 'legacy-context' };
      const application = {
        global: { env: 'browser' }
      } as Record<string, unknown>;
      const coreModule = jest.fn();
      const renderModule = jest.fn();
      const pickModule = jest.fn();
      const graphicModule = jest.fn();
      const pluginModule = jest.fn();
      const loadBuiltinContributions = jest.fn();
      const loadRenderContributions = jest.fn();
      const preLoadAllModule = jest.fn();
      const resolveLegacySingleton = jest.fn((token: string) => {
        const map: Record<string, unknown> = {
          GraphicUtil: graphicUtilInstance,
          TransformUtil: transformUtilInstance,
          GraphicService: graphicServiceInstance,
          LayerService: layerServiceInstance
        };

        return map[token];
      });
      const resolveLegacyNamed = jest.fn((token: string, name: string) => {
        if (name !== 'browser') {
          return undefined;
        }
        if (token === 'CanvasFactory') {
          return canvasFactoryInstance;
        }
        if (token === 'Context2dFactory') {
          return context2dFactoryInstance;
        }
        return undefined;
      });

      jest.doMock('../../../src/application', () => ({
        application
      }));
      jest.doMock('../../../src/global', () => ({
        vglobal: globalInstance
      }));
      jest.doMock('../../../src/legacy/bootstrap', () => ({
        createLegacySingletonProxy: jest.fn(
          (resolver: () => unknown) =>
            new Proxy({} as Record<string, unknown>, {
              get(_target, key: PropertyKey) {
                return (resolver() as any)[key];
              }
            })
        ),
        preLoadAllModule,
        getLegacyBindingContext: jest.fn(() => legacyBindingContext),
        resolveLegacySingleton,
        resolveLegacyNamed
      }));
      jest.doMock('../../../src/core/core-modules', () => ({
        __esModule: true,
        default: coreModule
      }));
      jest.doMock('../../../src/render/render-modules', () => ({
        __esModule: true,
        default: renderModule
      }));
      jest.doMock('../../../src/picker/pick-modules', () => ({
        __esModule: true,
        default: pickModule
      }));
      jest.doMock('../../../src/graphic/graphic-service/graphic-module', () => ({
        __esModule: true,
        default: graphicModule
      }));
      jest.doMock('../../../src/plugins/plugin-modules', () => ({
        __esModule: true,
        default: pluginModule
      }));
      jest.doMock('../../../src/core/contributions/modules', () => ({
        __esModule: true,
        default: loadBuiltinContributions
      }));
      jest.doMock('../../../src/render/contributions/modules', () => ({
        __esModule: true,
        default: loadRenderContributions
      }));
      jest.doMock('../../../src/constants', () => ({
        VGlobal: 'VGlobal'
      }));
      jest.doMock('../../../src/core/constants', () => ({
        GraphicUtil: 'GraphicUtil',
        LayerService: 'LayerService',
        TransformUtil: 'TransformUtil'
      }));
      jest.doMock('../../../src/graphic/constants', () => ({
        GraphicService: 'GraphicService'
      }));
      jest.doMock('../../../src/canvas/constants', () => ({
        CanvasFactory: 'CanvasFactory',
        Context2dFactory: 'Context2dFactory'
      }));

      const mod = require('../../../src/modules');

      expect(preLoadAllModule).not.toHaveBeenCalled();
      expect(mod.container).toBe(legacyBindingContext);
      expect(mod.vglobal).toBe(globalInstance);
      expect((mod.graphicUtil as { id: string }).id).toBe('graphic-util');
      expect((mod.transformUtil as { id: string }).id).toBe('transform-util');
      expect((mod.graphicService as { id: string }).id).toBe('graphic-service');
      expect((mod.layerService as { id: string }).id).toBe('layer-service');
      expect(application.global).toBe(globalInstance);
      expect((application.graphicUtil as { id: string }).id).toBe('graphic-util');
      expect((application.transformUtil as { id: string }).id).toBe('transform-util');
      expect((application.graphicService as { id: string }).id).toBe('graphic-service');
      expect((application.layerService as { id: string }).id).toBe('layer-service');
      expect(typeof application.canvasFactory).toBe('function');
      expect(typeof application.context2dFactory).toBe('function');
      expect((application.canvasFactory as (env: string) => unknown)('browser')).toBe(canvasFactoryInstance);
      expect((application.context2dFactory as (env: string) => unknown)('browser')).toBe(context2dFactoryInstance);
      expect(resolveLegacySingleton).toHaveBeenCalledWith('GraphicUtil');
      expect(resolveLegacySingleton).toHaveBeenCalledWith('TransformUtil');
      expect(resolveLegacySingleton).toHaveBeenCalledWith('GraphicService');
      expect(resolveLegacySingleton).toHaveBeenCalledWith('LayerService');
      expect(resolveLegacyNamed).toHaveBeenCalledWith('CanvasFactory', 'browser');
      expect(resolveLegacyNamed).toHaveBeenCalledWith('Context2dFactory', 'browser');
    });
  });
});
