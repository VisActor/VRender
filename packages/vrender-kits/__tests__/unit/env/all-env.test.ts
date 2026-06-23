import type * as AllEnvModule from '../../../src/env/all';

describe('env/all', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('loadAllModule loads all env modules once and installs onSetEnv hook', () => {
    jest.isolateModules(() => {
      const loadBrowserEnv = jest.fn();
      const loadFeishuEnv = jest.fn();
      const loadLynxEnv = jest.fn();
      const loadNodeEnv = jest.fn();
      const loadTaroEnv = jest.fn();
      const loadWxEnv = jest.fn();
      const loadCanvasPicker = jest.fn();
      const loadMathPicker = jest.fn();
      const getLegacyBindingContext = jest.fn(() => ({ id: 'legacy' }));

      let onSetEnvCb: ((lastEnv: any, env: any) => void) | null = null;

      jest.doMock('@visactor/vrender-core', () => {
        return {
          getLegacyBindingContext,
          vglobal: {
            hooks: {
              onSetEnv: {
                tap: jest.fn((_name: string, cb: any) => {
                  onSetEnvCb = cb;
                })
              }
            }
          }
        };
      });

      jest.doMock('../../../src/env/browser', () => ({ loadBrowserEnv }));
      jest.doMock('../../../src/env/feishu', () => ({ loadFeishuEnv }));
      jest.doMock('../../../src/env/lynx', () => ({ loadLynxEnv }));
      jest.doMock('../../../src/env/node', () => ({ loadNodeEnv }));
      jest.doMock('../../../src/env/taro', () => ({ loadTaroEnv }));
      jest.doMock('../../../src/env/wx', () => ({ loadWxEnv }));
      jest.doMock('../../../src/picker/canvas-module', () => ({ loadCanvasPicker }));
      jest.doMock('../../../src/picker/math-module', () => ({ loadMathPicker }));

      const { loadAllModule, loadAllEnv } = jest.requireActual('../../../src/env/all') as typeof AllEnvModule;

      loadAllEnv();

      const legacyContext = getLegacyBindingContext.mock.results[0].value;
      expect(loadBrowserEnv).toHaveBeenCalledWith(legacyContext, false);
      expect(loadFeishuEnv).toHaveBeenCalledWith(legacyContext, false);
      expect(loadLynxEnv).toHaveBeenCalledWith(legacyContext, false);
      expect(loadNodeEnv).toHaveBeenCalledWith(legacyContext, false);
      expect(loadTaroEnv).toHaveBeenCalledWith(legacyContext, false);
      expect(loadWxEnv).toHaveBeenCalledWith(legacyContext, false);
      expect(loadCanvasPicker).toHaveBeenCalledWith(legacyContext);

      expect(onSetEnvCb).toBeTruthy();
      const envCallback = onSetEnvCb;
      expect(envCallback).toBeTruthy();
      if (!envCallback) {
        throw new Error('Expected onSetEnv callback to be registered');
      }

      envCallback('browser', 'browser');
      expect(loadMathPicker).not.toHaveBeenCalled();

      envCallback('browser', 'node');
      expect(loadMathPicker).toHaveBeenCalledWith(legacyContext);

      // ensure idempotent
      loadAllModule();
      expect(loadBrowserEnv).toHaveBeenCalledTimes(1);
    });
  });
});
