describe('env/browser', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('loadBrowserEnv loads modules once and optionally loads picker', () => {
    jest.isolateModules(() => {
      const loadCanvasPicker = jest.fn();
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

      const bindBrowserCanvasModules = jest.fn();
      jest.doMock('../../../src/canvas/contributions/browser/modules', () => ({
        bindBrowserCanvasModules
      }));

      const bindBrowserWindowContribution = jest.fn();
      jest.doMock('../../../src/window/contributions/browser-contribution', () => ({
        bindBrowserWindowContribution
      }));

      jest.doMock('../../../src/picker/canvas-module', () => ({ loadCanvasPicker }));

      jest.doMock('../../../src/env/contributions/browser-contribution', () => ({
        BrowserEnvContribution: class {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { loadBrowserEnv } = require('../../../src/env/browser');

      loadBrowserEnv();
      loadBrowserEnv();

      expect(loadCanvasPicker).toHaveBeenCalledTimes(1);
      expect(getLegacyBindingContext).toHaveBeenCalledTimes(2);
      expect(loadCanvasPicker).toHaveBeenCalledWith(legacyContext);

      // explicit bindings happen exactly once
      expect(bind).toHaveBeenCalled();

      // loadPicker = false
      loadBrowserEnv.__loaded = false;
      loadBrowserEnv(undefined, false);
      expect(loadCanvasPicker).toHaveBeenCalledTimes(1);

      // already bound, callback is a no-op
      expect(bind).toHaveBeenCalled();
    });
  });

  test('initBrowserEnv uses default container', () => {
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

      const bindBrowserCanvasModules = jest.fn();
      jest.doMock('../../../src/canvas/contributions/browser/modules', () => ({
        bindBrowserCanvasModules
      }));

      const bindBrowserWindowContribution = jest.fn();
      jest.doMock('../../../src/window/contributions/browser-contribution', () => ({
        bindBrowserWindowContribution
      }));

      jest.doMock('../../../src/picker/canvas-module', () => ({ loadCanvasPicker: jest.fn() }));

      jest.doMock('../../../src/env/contributions/browser-contribution', () => ({
        BrowserEnvContribution: class {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { initBrowserEnv } = require('../../../src/env/browser');
      initBrowserEnv();

      expect(getLegacyBindingContext).toHaveBeenCalledTimes(1);
      expect(bind).toHaveBeenCalled();
    });
  });
});
