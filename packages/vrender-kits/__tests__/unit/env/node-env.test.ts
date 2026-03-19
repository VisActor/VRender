declare var require: any;

describe('env/node', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('loadNodeEnv loads modules only once', () => {
    jest.isolateModules(() => {
      const bindReturn: any = {
        toSelf: () => ({ inSingletonScope: () => bindReturn }),
        toService: () => bindReturn
      };
      const bind = jest.fn(() => bindReturn);

      jest.doMock('@visactor/vrender-core', () => {
        class ContainerModule {
          public _cb: any;
          constructor(cb: any) {
            this._cb = cb;
          }
        }
        return {
          container: { load: jest.fn() },
          EnvContribution: Symbol('EnvContribution'),
          ContainerModule
        };
      });

      jest.doMock('../../../src/canvas/contributions/node/modules', () => ({
        nodeCanvasModule: { id: 'nodeCanvasModule' }
      }));

      jest.doMock('../../../src/window/contributions/node-contribution', () => ({
        nodeWindowModule: { id: 'nodeWindowModule' }
      }));

      jest.doMock('../../../src/env/contributions/node-contribution', () => ({
        NodeEnvContribution: class {}
      }));

      const { loadNodeEnv } = require('../../../src/env/node');

      const container = {
        load: jest.fn((module: any) => {
          module?._cb && module._cb(bind);
        })
      } as any;

      loadNodeEnv(container);
      loadNodeEnv(container);

      expect(container.load).toHaveBeenCalledTimes(3);
      expect(bind).toHaveBeenCalledTimes(2);

      // already bound, callback is a no-op
      loadNodeEnv.__loaded = false;
      const container2 = {
        load: jest.fn((module: any) => {
          module?._cb && module._cb(bind);
        })
      } as any;

      loadNodeEnv(container2);
      expect(bind).toHaveBeenCalledTimes(2);
    });
  });

  test('initNodeEnv uses default container', () => {
    jest.isolateModules(() => {
      const bindReturn: any = {
        toSelf: () => ({ inSingletonScope: () => bindReturn }),
        toService: () => bindReturn
      };
      const bind = jest.fn(() => bindReturn);

      const coreContainer = {
        load: jest.fn((module: any) => {
          module?._cb && module._cb(bind);
        })
      };

      jest.doMock('@visactor/vrender-core', () => {
        class ContainerModule {
          public _cb: any;
          constructor(cb: any) {
            this._cb = cb;
          }
        }
        return {
          container: coreContainer,
          EnvContribution: Symbol('EnvContribution'),
          ContainerModule
        };
      });

      jest.doMock('../../../src/canvas/contributions/node/modules', () => ({
        nodeCanvasModule: { id: 'nodeCanvasModule' }
      }));

      jest.doMock('../../../src/window/contributions/node-contribution', () => ({
        nodeWindowModule: { id: 'nodeWindowModule' }
      }));

      jest.doMock('../../../src/env/contributions/node-contribution', () => ({
        NodeEnvContribution: class {}
      }));

      const { initNodeEnv } = require('../../../src/env/node');
      initNodeEnv();

      expect(coreContainer.load).toHaveBeenCalled();
      expect(bind).toHaveBeenCalledTimes(2);
    });
  });
});
