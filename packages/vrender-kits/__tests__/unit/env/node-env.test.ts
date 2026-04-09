describe('env/node', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('loadNodeEnv loads modules only once', () => {
    jest.isolateModules(() => {
      const getLegacyBindingContext = jest.fn();
      const bindReturn: any = {
        toSelf: () => ({ inSingletonScope: () => bindReturn }),
        toService: () => bindReturn
      };
      const bind = jest.fn(() => bindReturn);
      const legacyContext = { bind, isBound: jest.fn(), rebind: jest.fn(), getAll: jest.fn(), getNamed: jest.fn() };
      getLegacyBindingContext.mockReturnValue(legacyContext);

      jest.doMock('@visactor/vrender-core', () => {
        return {
          getLegacyBindingContext,
          EnvContribution: Symbol('EnvContribution')
        };
      });

      const bindNodeCanvasModules = jest.fn();
      jest.doMock('../../../src/canvas/contributions/node/modules', () => ({
        bindNodeCanvasModules
      }));

      const bindNodeWindowContribution = jest.fn();
      jest.doMock('../../../src/window/contributions/node-contribution', () => ({
        bindNodeWindowContribution
      }));

      jest.doMock('../../../src/env/contributions/node-contribution', () => ({
        NodeEnvContribution: class {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { loadNodeEnv } = require('../../../src/env/node');

      loadNodeEnv();
      loadNodeEnv();

      expect(bind).toHaveBeenCalled();
      expect(getLegacyBindingContext).toHaveBeenCalledTimes(2);

      // already bound, callback is a no-op
      loadNodeEnv.__loaded = false;

      loadNodeEnv();
      expect(bind).toHaveBeenCalled();
    });
  });

  test('initNodeEnv uses default container', () => {
    jest.isolateModules(() => {
      const getLegacyBindingContext = jest.fn();
      const bindReturn: any = {
        toSelf: () => ({ inSingletonScope: () => bindReturn }),
        toService: () => bindReturn
      };
      const bind = jest.fn(() => bindReturn);

      const legacyContext = {
        bind,
        isBound: jest.fn(),
        rebind: jest.fn(),
        getAll: jest.fn(),
        getNamed: jest.fn()
      };
      getLegacyBindingContext.mockReturnValue(legacyContext);

      jest.doMock('@visactor/vrender-core', () => {
        return {
          getLegacyBindingContext,
          EnvContribution: Symbol('EnvContribution')
        };
      });

      const bindNodeCanvasModules = jest.fn();
      jest.doMock('../../../src/canvas/contributions/node/modules', () => ({
        bindNodeCanvasModules
      }));

      const bindNodeWindowContribution = jest.fn();
      jest.doMock('../../../src/window/contributions/node-contribution', () => ({
        bindNodeWindowContribution
      }));

      jest.doMock('../../../src/env/contributions/node-contribution', () => ({
        NodeEnvContribution: class {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { initNodeEnv } = require('../../../src/env/node');
      initNodeEnv();

      expect(getLegacyBindingContext).toHaveBeenCalledTimes(1);
      expect(bind).toHaveBeenCalled();
    });
  });
});
