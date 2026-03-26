declare var require: any;

describe('env/browser', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('loadBrowserEnv loads modules once and optionally loads picker', () => {
    jest.isolateModules(() => {
      const loadCanvasPicker = jest.fn();
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

      jest.doMock('../../../src/canvas/contributions/browser/modules', () => ({
        browserCanvasModule: { id: 'browserCanvasModule' }
      }));

      jest.doMock('../../../src/window/contributions/browser-contribution', () => ({
        browserWindowModule: { id: 'browserWindowModule' }
      }));

      jest.doMock('../../../src/picker/canvas-module', () => ({ loadCanvasPicker }));

      jest.doMock('../../../src/env/contributions/browser-contribution', () => ({
        BrowserEnvContribution: class {}
      }));

      const { loadBrowserEnv } = require('../../../src/env/browser');

      const container = {
        load: jest.fn((module: any) => {
          module?._cb && module._cb(bind);
        })
      } as any;

      loadBrowserEnv(container);
      loadBrowserEnv(container);

      expect(container.load).toHaveBeenCalledTimes(3);
      expect(loadCanvasPicker).toHaveBeenCalledTimes(1);

      // callback has bound services exactly once
      expect(bind).toHaveBeenCalledTimes(2);

      // loadPicker = false
      const container2 = {
        load: jest.fn((module: any) => {
          module?._cb && module._cb(bind);
        })
      } as any;
      loadBrowserEnv.__loaded = false;
      loadBrowserEnv(container2, false);
      expect(loadCanvasPicker).toHaveBeenCalledTimes(1);

      // already bound, callback is a no-op
      expect(bind).toHaveBeenCalledTimes(2);
    });
  });

  test('initBrowserEnv uses default container', () => {
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

      jest.doMock('../../../src/canvas/contributions/browser/modules', () => ({
        browserCanvasModule: { id: 'browserCanvasModule' }
      }));

      jest.doMock('../../../src/window/contributions/browser-contribution', () => ({
        browserWindowModule: { id: 'browserWindowModule' }
      }));

      jest.doMock('../../../src/picker/canvas-module', () => ({ loadCanvasPicker: jest.fn() }));

      jest.doMock('../../../src/env/contributions/browser-contribution', () => ({
        BrowserEnvContribution: class {}
      }));

      const { initBrowserEnv } = require('../../../src/env/browser');
      initBrowserEnv();

      expect(coreContainer.load).toHaveBeenCalled();
      expect(bind).toHaveBeenCalledTimes(2);
    });
  });
});
