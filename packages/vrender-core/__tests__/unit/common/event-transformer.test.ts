import type { Matrix } from '@visactor/vutils';
import {
  createCanvasEventTransformer,
  createEventTransformer,
  mapToCanvasPointForCanvas,
  registerGlobalEventTransformer,
  registerWindowEventTransformer,
  transformPointForCanvas
} from '../../../src/common/event-transformer';

const globalAny = globalThis as any;

// Make tests runnable in node environment as well.
if (!globalAny.MouseEvent) {
  globalAny.MouseEvent = class {
    public type: string;
    public clientX: number;
    public clientY: number;

    constructor(type: string, init?: any) {
      this.type = type;
      this.clientX = init?.clientX ?? 0;
      this.clientY = init?.clientY ?? 0;
      Object.assign(this, init);
    }
  };
}

if (!globalAny.PointerEvent) {
  globalAny.PointerEvent = globalAny.MouseEvent;
}

if (!globalAny.TouchEvent) {
  globalAny.TouchEvent = class {
    public type: string;
    public touches: any[];
    public changedTouches: any[];

    constructor(type: string, init?: any) {
      this.type = type;
      this.touches = init?.touches ?? [];
      this.changedTouches = init?.changedTouches ?? [];
      Object.assign(this, init);
    }
  };
}

describe('event-transformer', () => {
  test('createEventTransformer returns original event for non coordinate events', () => {
    const getMatrix = () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 } as any as Matrix);
    const getRect = () => ({ x1: 0, y1: 0, x2: 10, y2: 10 } as any);
    const transformPoint = jest.fn();

    const transformer = createEventTransformer({} as any, getMatrix, getRect, transformPoint);

    const event = { type: 'custom' } as any;
    expect(transformer(event)).toBe(event);
    expect(transformPoint).not.toHaveBeenCalled();
  });

  test('createEventTransformer returns original event when matrix is identity', () => {
    const getMatrix = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } as any as Matrix);
    const getRect = () => ({ x1: 0, y1: 0, x2: 10, y2: 10 } as any);
    const transformPoint = jest.fn();

    const transformer = createEventTransformer({} as any, getMatrix, getRect, transformPoint);

    const event = new globalAny.MouseEvent('click', { clientX: 10, clientY: 20 });
    expect(transformer(event)).toBe(event);
    expect(transformPoint).not.toHaveBeenCalled();
  });

  test('createEventTransformer transforms MouseEvent and keeps target/currentTarget', () => {
    const getMatrix = () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 } as any as Matrix);
    const getRect = () => ({ x1: 0, y1: 0, x2: 10, y2: 10 } as any);

    const transformPoint = jest.fn(
      (clientX: number, clientY: number, _matrix: Matrix, _rect: any, transformedEvent: any) => {
        Object.assign(transformedEvent, { _canvasX: clientX + 1, _canvasY: clientY + 2 });
      }
    );

    const transformer = createEventTransformer({} as any, getMatrix, getRect, transformPoint);

    const event = new globalAny.MouseEvent('click', { clientX: 10, clientY: 20 });
    const target = { a: 1 };
    const currentTarget = { b: 2 };
    Object.defineProperties(event, {
      target: { value: target },
      currentTarget: { value: currentTarget }
    });

    const transformed = transformer(event) as any;

    expect(transformed).not.toBe(event);
    expect(transformPoint).toHaveBeenCalledTimes(1);
    expect(transformPoint).toHaveBeenCalledWith(10, 20, expect.any(Object), expect.any(Object), transformed);
    expect(transformed.target).toBe(target);
    expect(transformed.currentTarget).toBe(currentTarget);
  });

  test('createEventTransformer transforms TouchEvent touches and changedTouches', () => {
    const getMatrix = () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 } as any as Matrix);
    const getRect = () => ({ x1: 0, y1: 0, x2: 10, y2: 10 } as any);

    const transformPoint = jest.fn();

    const transformer = createEventTransformer({} as any, getMatrix, getRect, transformPoint);

    const event = new globalAny.TouchEvent('touchmove', {
      touches: [{ clientX: 1, clientY: 2 }],
      changedTouches: [{ clientX: 3, clientY: 4 }]
    });

    transformer(event);

    expect(transformPoint).toHaveBeenCalledTimes(2);
    expect(transformPoint).toHaveBeenNthCalledWith(1, 1, 2, expect.any(Object), expect.any(Object), expect.any(Object));
    expect(transformPoint).toHaveBeenNthCalledWith(2, 3, 4, expect.any(Object), expect.any(Object), expect.any(Object));
  });

  test('createCanvasEventTransformer uses parentElement when exists', () => {
    const getMatrix = () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 } as any as Matrix);
    const getRect = () => ({ x1: 0, y1: 0, x2: 10, y2: 10 } as any);
    const transformPoint = jest.fn();

    const parent = {};
    const canvas = { parentElement: parent } as any as HTMLCanvasElement;

    const transformer = createCanvasEventTransformer(canvas, getMatrix, getRect, transformPoint);
    transformer(new globalAny.MouseEvent('click', { clientX: 1, clientY: 2 }));

    expect(transformPoint).toHaveBeenCalledTimes(1);
  });

  test('registerWindowEventTransformer and registerGlobalEventTransformer install transformer', () => {
    const getMatrix = () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 } as any as Matrix);
    const getRect = () => ({ x1: 0, y1: 0, x2: 10, y2: 10 } as any);
    const transformPoint = jest.fn();

    const win = { setEventListenerTransformer: jest.fn() } as any;
    registerWindowEventTransformer(win, {} as any, getMatrix, getRect, transformPoint);
    expect(win.setEventListenerTransformer).toHaveBeenCalledTimes(1);

    const transformer1 = win.setEventListenerTransformer.mock.calls[0][0];
    transformer1(new globalAny.MouseEvent('click', { clientX: 1, clientY: 2 }));
    expect(transformPoint).toHaveBeenCalledTimes(1);

    const glob = { setEventListenerTransformer: jest.fn() } as any;
    registerGlobalEventTransformer(glob, {} as any, getMatrix, getRect, transformPoint);
    expect(glob.setEventListenerTransformer).toHaveBeenCalledTimes(1);

    const transformer2 = glob.setEventListenerTransformer.mock.calls[0][0];
    transformer2(new globalAny.MouseEvent('click', { clientX: 1, clientY: 2 }));
    expect(transformPoint).toHaveBeenCalledTimes(2);
  });

  test('transformPointForCanvas defines _canvasX/_canvasY and mapToCanvasPointForCanvas reads them', () => {
    const matrix = {
      a: 2,
      b: 0,
      c: 0,
      d: 2,
      e: 0,
      f: 0,
      transformPoint: (inPoint: any, outPoint: any) => {
        outPoint.x = inPoint.x + 10;
        outPoint.y = inPoint.y + 20;
      }
    } as any as Matrix;

    const transformedEvent: any = {};
    transformPointForCanvas(1, 2, matrix, {} as any, transformedEvent);

    expect(transformedEvent._canvasX).toBe(11);
    expect(transformedEvent._canvasY).toBe(22);
    expect(mapToCanvasPointForCanvas(transformedEvent)).toEqual({ x: 11, y: 22 });
  });

  test('mapToCanvasPointForCanvas supports changedTouches and fallback', () => {
    expect(mapToCanvasPointForCanvas({ changedTouches: [{ _canvasX: 5, _canvasY: 6 }] } as any)).toEqual({ x: 5, y: 6 });
    expect(mapToCanvasPointForCanvas({} as any)).toEqual({ x: 0, y: 0 });
  });
});
