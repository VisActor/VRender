export {};
declare const require: any;

describe('legacy binding context', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should support singleton, named bindings, service aliases and rebind', () => {
    jest.isolateModules(() => {
      const { createLegacyBindingContext } = require('../../../src/legacy/binding-context');

      const context = createLegacyBindingContext();
      const ServiceToken = Symbol('ServiceToken');
      const NamedToken = Symbol('NamedToken');
      const ReplaceToken = Symbol('ReplaceToken');
      const AliasTarget = Symbol('AliasTarget');

      class SelfBoundService {
        readonly id = Symbol('self');
      }

      context.bind(SelfBoundService).toSelf().inSingletonScope();
      context
        .bind(AliasTarget)
        .toDynamicValue(() => ({ id: 'alias-target' }))
        .inSingletonScope();
      context.bind(ServiceToken).toService(AliasTarget);
      context.bind(NamedToken).toConstantValue('browser-factory').whenTargetNamed('browser');
      context.bind(NamedToken).toConstantValue('node-factory').whenTargetNamed('node');
      context.bind(ReplaceToken).toConstantValue('before');

      expect(context.isBound(ServiceToken)).toBe(true);
      expect(context.isBound(Symbol('missing'))).toBe(false);

      const [selfInstance] = context.getAll(SelfBoundService) as SelfBoundService[];
      const [selfInstanceAgain] = context.getAll(SelfBoundService) as SelfBoundService[];
      expect(selfInstance).toBeInstanceOf(SelfBoundService);
      expect(selfInstanceAgain).toBe(selfInstance);

      const [aliasInstance] = context.getAll(ServiceToken) as Array<{ id: string }>;
      const [aliasInstanceAgain] = context.getAll(ServiceToken) as Array<{ id: string }>;
      expect(aliasInstance).toEqual({ id: 'alias-target' });
      expect(aliasInstanceAgain).toBe(aliasInstance);

      expect(context.getNamed(NamedToken, 'browser')).toBe('browser-factory');
      expect(context.getNamed(NamedToken, 'node')).toBe('node-factory');
      expect(context.getNamed(NamedToken, 'miniapp')).toBeUndefined();

      context.rebind(ReplaceToken).toConstantValue('after');
      expect(context.getAll(ReplaceToken)).toEqual(['after']);
    });
  });

  test('preLoadAllModule should bootstrap modules through the lightweight binding context', () => {
    jest.isolateModules(() => {
      const singletonInstance = { id: 'singleton' };
      const namedInstance = { id: 'browser-factory' };
      const coreModule = jest.fn(({ bind }: { bind: any }) => {
        bind('SingletonToken').toConstantValue(singletonInstance);
      });
      const renderModule = jest.fn();
      const pickModule = jest.fn();
      const graphicModule = jest.fn();
      const pluginModule = jest.fn();
      const loadBuiltinContributions = jest.fn((context: { bind: any }) => {
        context.bind('NamedToken').toConstantValue(namedInstance).whenTargetNamed('browser');
      });
      const loadRenderContributions = jest.fn();

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

      const bootstrap = require('../../../src/legacy/bootstrap');

      expect(bootstrap.resolveLegacySingleton('SingletonToken')).toBe(singletonInstance);
      expect(bootstrap.resolveLegacyNamed('NamedToken', 'browser')).toBe(namedInstance);
      expect(bootstrap.getLegacyBindingContext().getAll('SingletonToken')).toEqual([singletonInstance]);

      bootstrap.preLoadAllModule();
      expect(coreModule).toHaveBeenCalledTimes(1);
      expect(renderModule).toHaveBeenCalledTimes(1);
      expect(pickModule).toHaveBeenCalledTimes(1);
      expect(graphicModule).toHaveBeenCalledTimes(1);
      expect(pluginModule).toHaveBeenCalledTimes(1);
      expect(loadBuiltinContributions).toHaveBeenCalledTimes(1);
      expect(loadRenderContributions).toHaveBeenCalledTimes(1);
    });
  });
});
