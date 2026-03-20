import { Direction } from '../../../../../src/common/enums';
import { QuadraticBezierCurve, divideQuad } from '../../../../../src/common/segment/curve/quadratic-bezier';

describe('segment/curve/quadratic-bezier', () => {
  test('getPointAt returns endpoints for t=0/1', () => {
    const curve = new QuadraticBezierCurve(
      { x: 0, y: 0 } as any,
      { x: 5, y: 10 } as any,
      { x: 10, y: 0 } as any
    );

    expect(curve.getPointAt(0)).toEqual({ x: 0, y: 0 });
    expect(curve.getPointAt(1)).toEqual({ x: 10, y: 0 });
  });

  test('getPointAt throws when defined=false', () => {
    const curve = new QuadraticBezierCurve(
      { x: 0, y: 0 } as any,
      { x: 5, y: 10 } as any,
      { x: 10, y: 0 } as any
    );
    (curve as any).defined = false;

    expect(() => curve.getPointAt(0.5)).toThrow('defined为false的点不能getPointAt');
  });

  test('divideQuad returns two curves that connect at split point', () => {
    const curve = new QuadraticBezierCurve(
      { x: 0, y: 0 } as any,
      { x: 5, y: 10 } as any,
      { x: 10, y: 0 } as any
    );

    const [c1, c2] = divideQuad(curve as any, 0.5);
    const split = curve.getPointAt(0.5);

    expect(c1.p0).toEqual({ x: 0, y: 0 });
    expect(c2.p2).toEqual({ x: 10, y: 0 });
    expect(c1.p2.x).toBeCloseTo(split.x);
    expect(c1.p2.y).toBeCloseTo(split.y);
    expect(c2.p0.x).toBeCloseTo(split.x);
    expect(c2.p0.y).toBeCloseTo(split.y);
  });

  test('getLength uses calcProjLength when direction provided', () => {
    const curve = new QuadraticBezierCurve(
      { x: 2, y: 7 } as any,
      { x: 3, y: 8 } as any,
      { x: 10, y: 1 } as any
    );

    expect(curve.getLength(Direction.ROW as any)).toBe(8);
    expect(curve.getLength(Direction.COLUMN as any)).toBe(6);
    expect(curve.getLength(999 as any)).toBe(0);
  });

  test('getLength returns 60 when points invalid', () => {
    const curve = new QuadraticBezierCurve(
      { x: Number.NaN, y: 0 } as any,
      { x: 5, y: 10 } as any,
      { x: 10, y: 0 } as any
    );

    expect(curve.getLength()).toBe(60);
  });

  test('draw handles percent branches', () => {
    const curve = new QuadraticBezierCurve(
      { x: 0, y: 0 } as any,
      { x: 5, y: 10 } as any,
      { x: 10, y: 0 } as any
    );

    const path = {
      moveTo: jest.fn(),
      quadraticCurveTo: jest.fn()
    };

    curve.draw(path as any, 1, 2, 2, 3, -1);
    expect(path.moveTo).toHaveBeenCalledWith(1, 2);
    expect(path.quadraticCurveTo).not.toHaveBeenCalled();

    path.moveTo.mockClear();
    curve.draw(path as any, 1, 2, 2, 3, 1);
    expect(path.quadraticCurveTo).toHaveBeenCalledWith(11, 32, 21, 2);

    path.quadraticCurveTo.mockClear();
    curve.draw(path as any, 0, 0, 1, 1, 0.5);
    const split = curve.getPointAt(0.5);
    const lastCall = path.quadraticCurveTo.mock.calls[0];
    expect(lastCall[2]).toBeCloseTo(split.x);
    expect(lastCall[3]).toBeCloseTo(split.y);
  });

  test('getYAt/includeX throw unsupported errors', () => {
    const curve = new QuadraticBezierCurve(
      { x: 0, y: 0 } as any,
      { x: 5, y: 10 } as any,
      { x: 10, y: 0 } as any
    );

    expect(() => curve.getYAt(0)).toThrow('QuadraticBezierCurve暂不支持getYAt');
    expect(() => curve.includeX(0)).toThrow('QuadraticBezierCurve暂不支持includeX');
  });
});
