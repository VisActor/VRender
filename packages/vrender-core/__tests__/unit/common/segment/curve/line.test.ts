import { Direction } from '../../../../../src/common/enums';
import { LineCurve, divideLinear } from '../../../../../src/common/segment/curve/line';

describe('segment/curve/line', () => {
  test('divideLinear splits into two line curves', () => {
    const curve = new LineCurve({ x: 0, y: 0 } as any, { x: 10, y: 0 } as any);
    const [c1, c2] = divideLinear(curve as any, 0.5);

    expect(c1.p0.x).toBe(0);
    expect(c1.p1.x).toBe(5);
    expect(c2.p0.x).toBe(5);
    expect(c2.p1.x).toBe(10);
  });

  test('getPointAt returns endpoints for t=0/1', () => {
    const curve = new LineCurve({ x: 1, y: 2 } as any, { x: 5, y: 6 } as any);

    expect(curve.getPointAt(0)).toEqual({ x: 1, y: 2 });
    expect(curve.getPointAt(1)).toEqual({ x: 5, y: 6 });
  });

  test('getPointAt throws when defined=false', () => {
    const curve = new LineCurve({ x: 0, y: 0 } as any, { x: 10, y: 0 } as any);
    (curve as any).defined = false;

    expect(() => curve.getPointAt(0.3)).toThrow('defined为false的点不能getPointAt');
  });

  test('getAngleAt caches computed angle', () => {
    const curve = new LineCurve({ x: 0, y: 0 } as any, { x: 10, y: 0 } as any);

    expect(curve.angle).toBeUndefined();
    expect(curve.getAngleAt(0.5)).toBe(0);
    expect(curve.angle).toBe(0);
    // second call should hit cache branch
    expect(curve.getAngleAt(0)).toBe(0);
  });

  test('includeX handles both directions', () => {
    const forward = new LineCurve({ x: 0, y: 0 } as any, { x: 10, y: 0 } as any);
    expect(forward.includeX(5)).toBe(true);

    const reverse = new LineCurve({ x: 10, y: 0 } as any, { x: 0, y: 0 } as any);
    expect(reverse.includeX(5)).toBe(true);
    expect(reverse.includeX(-1)).toBe(false);
  });

  test('getLength uses calcProjLength when direction provided', () => {
    const curve = new LineCurve({ x: 2, y: 7 } as any, { x: 10, y: 1 } as any);

    expect(curve.getLength(Direction.ROW as any)).toBe(8);
    expect(curve.getLength(Direction.COLUMN as any)).toBe(6);
    expect(curve.getLength(999 as any)).toBe(0);
  });

  test('getLength returns 60 when points invalid', () => {
    const curve = new LineCurve({ x: Number.NaN, y: 0 } as any, { x: 0, y: 0 } as any);

    expect(curve.getLength()).toBe(60);
  });

  test('getYAt returns Infinity when x not in range', () => {
    const curve = new LineCurve({ x: 0, y: 0 } as any, { x: 10, y: 10 } as any);

    expect(curve.getYAt(100)).toBe(Infinity);
  });

  test('draw handles percent branches', () => {
    const curve = new LineCurve({ x: 0, y: 0 } as any, { x: 10, y: 0 } as any);
    const path = {
      moveTo: jest.fn(),
      lineTo: jest.fn()
    };

    curve.draw(path as any, 1, 2, 2, 3, -1);
    expect(path.moveTo).toHaveBeenCalledWith(1, 2);
    expect(path.lineTo).not.toHaveBeenCalled();

    path.moveTo.mockClear();
    curve.draw(path as any, 1, 2, 2, 3, 0.5);
    expect(path.moveTo).toHaveBeenCalledWith(1, 2);
    expect(path.lineTo).toHaveBeenCalledWith(11, 2);

    path.lineTo.mockClear();
    curve.draw(path as any, 1, 2, 2, 3, 1);
    expect(path.lineTo).toHaveBeenCalledWith(21, 2);
  });
});
