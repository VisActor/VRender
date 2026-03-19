declare var require: any;

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

      let onSetEnvCb: ((lastEnv: any, env: any) => void) | null = null;

      jest.doMock('@visactor/vrender-core', () => {
        return {
          container: {},
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

      const { loadAllModule, loadAllEnv } = require('../../../src/env/all');

      const container = {} as any;
      loadAllEnv(container);

      expect(loadBrowserEnv).toHaveBeenCalledWith(container, false);
      expect(loadFeishuEnv).toHaveBeenCalledWith(container, false);
      expect(loadLynxEnv).toHaveBeenCalledWith(container, false);
      expect(loadNodeEnv).toHaveBeenCalledWith(container, false);
      expect(loadTaroEnv).toHaveBeenCalledWith(container, false);
      expect(loadWxEnv).toHaveBeenCalledWith(container, false);
      expect(loadCanvasPicker).toHaveBeenCalledWith(container);

      expect(onSetEnvCb).toBeTruthy();

      onSetEnvCb!('browser', 'browser');
      expect(loadMathPicker).not.toHaveBeenCalled();

      onSetEnvCb!('browser', 'node');
      expect(loadMathPicker).toHaveBeenCalledWith(container);

      // ensure idempotent
      loadAllModule(container);
      expect(loadBrowserEnv).toHaveBeenCalledTimes(1);
    });
  });
});
