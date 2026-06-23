import { LynxEnvContribution } from '../../src/env/contributions/lynx-contribution';
import { LynxWindowHandlerContribution } from '../../src/window/contributions/lynx-contribution';

describe('lynx window event contribution', () => {
  test('normalizes forwarded lynx event target to native canvas', () => {
    const nativeCanvas = { id: 'vrender-main' };
    const handler = new LynxWindowHandlerContribution();
    (handler as any).canvas = { nativeCanvas };

    const listener = jest.fn();
    handler.addEventListener('touchmove', listener);

    const event = {
      type: 'touchmove',
      target: { id: 'lynx-event-target' },
      currentTarget: { id: 'lynx-current-target' },
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
    const handler = new LynxWindowHandlerContribution();
    (handler as any).canvas = { nativeCanvas };

    const listener = jest.fn();
    handler.addEventListener('touchstart', listener);

    const event = {
      type: 'touchstart',
      changedTouches: [{ pageX: 34, pageY: 56 }],
      touches: [{ pageX: 34, pageY: 56 }]
    };

    expect(handler.dispatchEvent(event)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].x).toBe(34);
    expect(listener.mock.calls[0][0].y).toBe(56);
    expect(listener.mock.calls[0][0].offsetX).toBe(34);
    expect(listener.mock.calls[0][0].offsetY).toBe(56);
    expect(listener.mock.calls[0][0].clientX).toBe(34);
    expect(listener.mock.calls[0][0].clientY).toBe(56);
    expect(listener.mock.calls[0][0].changedTouches[0].x).toBe(34);
    expect(listener.mock.calls[0][0].changedTouches[0].y).toBe(56);
  });

  test('fills missing touches from changedTouches for touchstart dispatch', () => {
    const nativeCanvas = { id: 'vrender-main' };
    const handler = new LynxWindowHandlerContribution();
    (handler as any).canvas = { nativeCanvas };

    const listener = jest.fn();
    handler.addEventListener('touchstart', listener);

    const event = {
      type: 'touchstart',
      changedTouches: [{ x: 14, y: 28 }]
    };

    expect(handler.dispatchEvent(event)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].touches).toBe(listener.mock.calls[0][0].changedTouches);
  });

  test('maps lynx touch events to canvas point from changed touch coordinates', () => {
    const env = new LynxEnvContribution();

    expect(
      env.mapToCanvasPoint({
        type: 'touchstart',
        changedTouches: [{ clientX: 42, clientY: 64 }]
      })
    ).toEqual({ x: 42, y: 64 });
  });

  test('reports unsupported svg loading as a failed result', async () => {
    const env = new LynxEnvContribution();

    await expect(env.loadSvg('<svg></svg>')).resolves.toEqual({
      data: null,
      loadState: 'fail'
    });
  });

  test('reports missing lynx canvas bridge with a clear error', () => {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };

    env.configure(service as any, {
      pixelRatio: 1,
      lynx: {}
    });

    expect(() =>
      env.createCanvas({
        id: 'main',
        width: 100,
        height: 80,
        dpr: 1
      })
    ).toThrow(/Lynx canvas bridge is unavailable/);
  });

  test('uses envParams canvasFactory when lynx global canvas APIs are unavailable', () => {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };
    const nativeCanvas = {
      getContext: jest.fn(() => ({ id: 'ctx' }))
    };
    const canvasFactory = jest.fn(() => nativeCanvas);

    env.configure(service as any, {
      pixelRatio: 2,
      lynx: {},
      canvasFactory
    });

    const canvas = env.createCanvas({
      id: 'main',
      width: 100,
      height: 80,
      dpr: 2
    });

    expect(canvasFactory).toHaveBeenCalledWith({
      id: 'main',
      width: 100,
      height: 80,
      dpr: 2,
      offscreen: false
    });
    expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
    expect((canvas as any).nativeCanvas).toBe(nativeCanvas);
    expect((env.getElementById('main') as any).nativeCanvas).toBe(nativeCanvas);
    expect((env.getElementById('main') as any).width).toBe(200);
    expect((env.getElementById('main') as any).height).toBe(160);
  });

  test('lazily creates a named stage canvas without app-level canvasIdLists', () => {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };
    const nativeCanvas = {
      getContext: jest.fn(() => ({ id: 'ctx' }))
    };
    const canvasFactory = jest.fn(() => nativeCanvas);

    env.configure(service as any, {
      pixelRatio: 2,
      lynx: {},
      canvasFactory
    });

    const canvas = env.createCanvas({
      id: 'vchart-canvas',
      width: 160,
      height: 90,
      dpr: 2
    });

    expect(canvasFactory).toHaveBeenCalledWith({
      id: 'vchart-canvas',
      width: 160,
      height: 90,
      dpr: 2,
      offscreen: false
    });
    expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(canvas).toBe(env.getElementById('vchart-canvas'));
    expect((canvas as any).width).toBe(320);
    expect((canvas as any).height).toBe(180);
  });

  test('window creation lazily registers a missing string canvas through the lynx env', () => {
    const nativeCanvas = {
      getContext: jest.fn(() => ({ id: 'ctx' })),
      getBoundingClientRect: jest.fn(() => ({ width: 160, height: 90 }))
    };
    const global = {
      getElementById: jest.fn(() => null),
      createCanvas: jest.fn(() => nativeCanvas)
    };
    const handler = new LynxWindowHandlerContribution(global as any);

    handler.createWindow({
      canvas: 'vtable-canvas',
      width: 160,
      height: 90,
      dpr: 2,
      canvasControled: false,
      title: ''
    });

    expect(global.createCanvas).toHaveBeenCalledWith({
      id: 'vtable-canvas',
      width: 160,
      height: 90,
      dpr: 2
    });
    expect(handler.getNativeHandler().nativeCanvas).toBe(nativeCanvas);
  });

  test('uses lynx krypton createCanvasNG and attaches it to the canvas view name', () => {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };
    const nativeCanvas = {
      attachToCanvasView: jest.fn(),
      getContext: jest.fn(() => ({ id: 'ctx' }))
    };
    const createCanvasNG = jest.fn(() => nativeCanvas);

    env.configure(service as any, {
      pixelRatio: 3,
      lynx: {
        krypton: {
          createCanvasNG
        }
      } as any
    });

    env.createCanvas({
      id: 'main',
      width: 120,
      height: 90,
      dpr: 3
    });

    expect(createCanvasNG).toHaveBeenCalledTimes(1);
    expect(createCanvasNG).toHaveBeenCalledWith();
    expect(nativeCanvas.attachToCanvasView).toHaveBeenCalledWith('main');
    expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
    expect((env.getElementById('main') as any).nativeCanvas).toBe(nativeCanvas);
    expect((env.getElementById('main') as any).width).toBe(360);
    expect((env.getElementById('main') as any).height).toBe(270);
  });

  test('uses lynx krypton createCanvas for canvas-ng views', () => {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };
    const nativeCanvas = {
      getContext: jest.fn(() => ({ id: 'ctx' }))
    };
    const createCanvas = jest.fn(() => nativeCanvas);
    const createCanvasNG = jest.fn();

    env.configure(service as any, {
      pixelRatio: 3,
      lynx: {
        krypton: {
          createCanvas,
          createCanvasNG
        }
      } as any
    });

    env.createCanvas({
      id: 'main',
      width: 120,
      height: 90,
      dpr: 3
    });

    expect(createCanvas).toHaveBeenCalledTimes(1);
    expect(createCanvas).toHaveBeenCalledWith('main');
    expect(createCanvasNG).not.toHaveBeenCalled();
    expect(nativeCanvas.getContext).toHaveBeenCalledWith('2d');
    expect((env.getElementById('main') as any).nativeCanvas).toBe(nativeCanvas);
    expect((env.getElementById('main') as any).width).toBe(360);
    expect((env.getElementById('main') as any).height).toBe(270);
  });

  test('uses lynx krypton CanvasElement constructor when createCanvasNG is unavailable', () => {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };
    const getContext = jest.fn(() => ({ id: 'ctx' }));
    const CanvasElement = jest.fn().mockImplementation((name: string) => ({
      name,
      getContext
    }));

    env.configure(service as any, {
      pixelRatio: 2,
      lynx: {
        krypton: {
          CanvasElement
        }
      } as any
    });

    env.createCanvas({
      id: 'main',
      width: 100,
      height: 80,
      dpr: 2
    });

    expect(CanvasElement).toHaveBeenCalledWith('main');
    expect(getContext).toHaveBeenCalledWith('2d');
    expect((env.getElementById('main') as any).nativeCanvas.name).toBe('main');
  });
});
