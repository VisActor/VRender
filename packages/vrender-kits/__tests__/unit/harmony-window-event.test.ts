import { HarmonyEnvContribution } from '../../src/env/contributions/harmony-contribution';
import { HarmonyWindowHandlerContribution } from '../../src/window/contributions/harmony-contribution';

describe('harmony window event contribution', () => {
  test('normalizes forwarded harmony event target to native canvas', () => {
    const nativeCanvas = { id: 'vrender-main' };
    const handler = new HarmonyWindowHandlerContribution();
    (handler as any).canvas = { nativeCanvas };

    const listener = jest.fn();
    handler.addEventListener('touchmove', listener);

    const event = {
      type: 'touchmove',
      target: { id: 'harmony-event-target' },
      currentTarget: { id: 'harmony-current-target' },
      touches: [{ x: 12, y: 24 }],
      changedTouches: [{ x: 12, y: 24 }]
    };

    expect(handler.dispatchEvent(event)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].target).toBe(nativeCanvas);
    expect(listener.mock.calls[0][0].currentTarget).toBe(nativeCanvas);
    expect(listener.mock.calls[0][0].offsetX).toBe(12);
    expect(listener.mock.calls[0][0].changedTouches[0].clientY).toBe(24);
  });

  test('normalizes touch coordinates to top-level event point', () => {
    const nativeCanvas = { id: 'vrender-main' };
    const handler = new HarmonyWindowHandlerContribution();
    (handler as any).canvas = { nativeCanvas };

    const listener = jest.fn();
    handler.addEventListener('touchstart', listener);

    const event = {
      type: 'touchstart',
      changedTouches: [{ pageX: 34, pageY: 56 }]
    };

    expect(handler.dispatchEvent(event)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].touches).toBe(listener.mock.calls[0][0].changedTouches);
    expect(listener.mock.calls[0][0].x).toBe(34);
    expect(listener.mock.calls[0][0].y).toBe(56);
    expect(listener.mock.calls[0][0].offsetX).toBe(34);
    expect(listener.mock.calls[0][0].offsetY).toBe(56);
    expect(listener.mock.calls[0][0].clientX).toBe(34);
    expect(listener.mock.calls[0][0].clientY).toBe(56);
  });

  test('maps harmony touch events to canvas point from changed touch coordinates', () => {
    const env = new HarmonyEnvContribution();

    expect(
      env.mapToCanvasPoint({
        type: 'touchstart',
        changedTouches: [{ clientX: 42, clientY: 64 }]
      })
    ).toEqual({ x: 42, y: 64 });
  });

  test('reports unsupported svg loading as a failed result', async () => {
    const env = new HarmonyEnvContribution();

    await expect(env.loadSvg('<svg></svg>')).resolves.toEqual({
      data: null,
      loadState: 'fail'
    });
  });

  test('lazily creates a named stage canvas without app-level canvasIdLists', () => {
    const env = new HarmonyEnvContribution();
    const service = {
      env: 'harmony',
      setActiveEnvContribution: jest.fn()
    };
    const nativeCanvas = {
      getContext: jest.fn(() => ({ id: 'ctx' }))
    };
    const canvasFactory = jest.fn(() => nativeCanvas);

    env.configure(
      service as any,
      {
        pixelRatio: 2,
        canvasFactory
      } as any
    );

    const canvas = env.createCanvas({
      id: 'harmony-vchart',
      width: 160,
      height: 90,
      dpr: 2
    });

    expect(canvasFactory).toHaveBeenCalledWith({
      id: 'harmony-vchart',
      width: 160,
      height: 90,
      dpr: 2,
      offscreen: false
    });
    expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(canvas).toBe(env.getElementById('harmony-vchart'));
    expect((canvas as any).width).toBe(320);
    expect((canvas as any).height).toBe(180);
  });

  test('window creation lazily registers a missing string canvas through the harmony env', () => {
    const nativeCanvas = {
      getContext: jest.fn(() => ({ id: 'ctx' })),
      getBoundingClientRect: jest.fn(() => ({ width: 160, height: 90 }))
    };
    const global = {
      getElementById: jest.fn(() => null),
      createCanvas: jest.fn(() => nativeCanvas)
    };
    const handler = new HarmonyWindowHandlerContribution(global as any);

    handler.createWindow({
      canvas: 'harmony-vtable',
      width: 160,
      height: 90,
      dpr: 2,
      canvasControled: false,
      title: ''
    });

    expect(global.createCanvas).toHaveBeenCalledWith({
      id: 'harmony-vtable',
      width: 160,
      height: 90,
      dpr: 2
    });
    expect(handler.getNativeHandler().nativeCanvas).toBe(nativeCanvas);
  });

  test('reports missing harmony canvas bridge with a clear error', () => {
    const env = new HarmonyEnvContribution();
    const service = {
      env: 'harmony',
      setActiveEnvContribution: jest.fn()
    };

    env.configure(
      service as any,
      {
        pixelRatio: 1
      } as any
    );

    expect(() =>
      env.createCanvas({
        id: 'missing',
        width: 100,
        height: 80,
        dpr: 1
      })
    ).toThrow(/Harmony canvas bridge is unavailable/);
  });
});
