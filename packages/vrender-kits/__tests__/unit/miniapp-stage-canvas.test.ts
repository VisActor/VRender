import { FeishuEnvContribution } from '../../src/env/contributions/feishu-contribution';
import { TaroEnvContribution } from '../../src/env/contributions/taro-contribution';
import { TTEnvContribution } from '../../src/env/contributions/tt-contribution';
import { WxEnvContribution } from '../../src/env/contributions/wx-contribution';
import { FeishuWindowHandlerContribution } from '../../src/window/contributions/feishu-contribution';
import { TaroWindowHandlerContribution } from '../../src/window/contributions/taro-contribution';
import { TTWindowHandlerContribution } from '../../src/window/contributions/tt-contribution';
import { WxWindowHandlerContribution } from '../../src/window/contributions/wx-contribution';

const miniAppCases = [
  ['feishu', FeishuEnvContribution, FeishuWindowHandlerContribution],
  ['taro', TaroEnvContribution, TaroWindowHandlerContribution],
  ['tt', TTEnvContribution, TTWindowHandlerContribution],
  ['wx', WxEnvContribution, WxWindowHandlerContribution]
] as const;

describe('miniapp stage-scoped canvas creation', () => {
  test.each(miniAppCases)(
    '%s creates a named stage canvas from canvasFactory without app-level canvas lists',
    (envName, EnvContribution) => {
      const env = new EnvContribution();
      const service = {
        env: envName,
        setActiveEnvContribution: jest.fn()
      };
      const nativeCanvas = {
        getContext: jest.fn(() => ({ id: `${envName}-ctx` }))
      };
      const canvasFactory = jest.fn(() => nativeCanvas);

      env.configure(
        service as any,
        {
          pixelRatio: 2,
          canvasFactory,
          domref: { width: 999, height: 888 },
          canvasIdLists: ['legacy-canvas'],
          freeCanvasIdx: 0
        } as any
      );

      expect(canvasFactory).not.toHaveBeenCalled();
      expect(env.getElementById('legacy-canvas')).toBeUndefined();

      const canvas = env.createCanvas({
        id: `${envName}-stage-canvas`,
        width: 160,
        height: 90,
        dpr: 2
      });

      expect(canvasFactory).toHaveBeenCalledWith({
        id: `${envName}-stage-canvas`,
        width: 160,
        height: 90,
        dpr: 2,
        offscreen: false
      });
      expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(canvas).toBe(env.getElementById(`${envName}-stage-canvas`));
      expect((canvas as any).width).toBe(320);
      expect((canvas as any).height).toBe(180);
    }
  );

  test.each(miniAppCases)(
    '%s creates an internal canvas from the app-scope canvasFactory',
    (envName, EnvContribution) => {
      const env = new EnvContribution();
      const service = {
        env: envName,
        setActiveEnvContribution: jest.fn()
      };
      const nativeCanvas = {
        getContext: jest.fn(() => ({ id: `${envName}-internal-ctx` }))
      };
      const canvasFactory = jest.fn(() => nativeCanvas);

      env.configure(service as any, {
        pixelRatio: 2,
        canvasFactory
      });

      const canvas = env.createCanvas({
        width: 100,
        height: 50,
        dpr: 2
      });

      expect(canvasFactory).toHaveBeenCalledWith({
        id: undefined,
        width: 100,
        height: 50,
        dpr: 2,
        offscreen: true
      });
      expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
      expect((canvas as any).width).toBe(200);
      expect((canvas as any).height).toBe(100);
    }
  );

  test.each(miniAppCases)(
    '%s window creation asks the env for a missing string canvas',
    (envName, _EnvContribution, WindowContribution) => {
      const nativeCanvas = {
        getContext: jest.fn(() => ({ id: `${envName}-ctx` })),
        getBoundingClientRect: jest.fn(() => ({ width: 160, height: 90 }))
      };
      const global = {
        getElementById: jest.fn(() => null),
        createCanvas: jest.fn(() => nativeCanvas)
      };
      const handler = new WindowContribution(global as any);

      handler.createWindow({
        canvas: `${envName}-stage-canvas`,
        width: 160,
        height: 90,
        dpr: 2,
        canvasControled: false,
        title: ''
      });

      expect(global.createCanvas).toHaveBeenCalledWith({
        id: `${envName}-stage-canvas`,
        width: 160,
        height: 90,
        dpr: 2
      });
      expect(handler.getNativeHandler().nativeCanvas).toBe(nativeCanvas);
    }
  );
});
