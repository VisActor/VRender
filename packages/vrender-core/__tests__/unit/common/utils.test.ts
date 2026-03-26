import {
  parseStroke,
  parsePadding,
  circleBounds,
  pointsEqual,
  pointsInterpolation,
  calculateLineHeight
} from '../../../src/common/utils';

describe('common/utils', () => {
  test('parseStroke supports boolean and array input', () => {
    expect(parseStroke(true)).toEqual({
      isFullStroke: true,
      stroke: [true, true, true, true]
    });

    expect(parseStroke([true, true] as any)).toEqual({
      isFullStroke: false,
      stroke: [true, true, false, false]
    });
  });

  test('parseStroke defaults to all-false stroke and keeps isFullStroke initial value', () => {
    const res = parseStroke(undefined as any);

    expect(res.stroke).toEqual([false, false, false, false]);
    // current implementation keeps initial true
    expect(res.isFullStroke).toBe(true);
  });

  test('parseStroke returns a shared vec4 array (subsequent calls overwrite previous result)', () => {
    const r1 = parseStroke(true);
    const r2 = parseStroke(false);

    expect(r1.stroke).toBe(r2.stroke);
    expect(r1.stroke).toEqual([false, false, false, false]);
  });

  test('parsePadding supports scalar and vec-like arrays', () => {
    expect(parsePadding(undefined as any)).toBe(0);
    expect(parsePadding(0 as any)).toBe(0);
    expect(parsePadding([])).toBe(0);
    expect(parsePadding([10])).toBe(10);

    expect(parsePadding([10, 20]) as any).toEqual([10, 20, 10, 20]);

    const arr = [1, 2, 3, 4];
    expect(parsePadding(arr as any)).toBe(arr);

    const arr3 = [1, 2, 3];
    expect(parsePadding(arr3 as any)).toBe(arr3);
  });

  test('parsePadding returns a shared vec4 array for length=2', () => {
    const a = parsePadding([1, 2]) as any;
    const b = parsePadding([3, 4]) as any;

    expect(a).toBe(b);
    expect(a).toEqual([3, 4, 3, 4]);
  });

  test('circleBounds expands bounds for common angle normalization cases', () => {
    const bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
      add(x: number, y: number) {
        this.minX = Math.min(this.minX, x);
        this.minY = Math.min(this.minY, y);
        this.maxX = Math.max(this.maxX, x);
        this.maxY = Math.max(this.maxY, y);
      }
    };

    circleBounds(Math.PI / 2, -Math.PI / 2, 10, bounds as any);

    expect(bounds.minX).toBeCloseTo(-10, 6);
    expect(bounds.maxX).toBeCloseTo(0, 6);
    expect(bounds.minY).toBeCloseTo(-10, 6);
    expect(bounds.maxY).toBeCloseTo(10, 6);
  });

  test('circleBounds supports negative startAngle normalization', () => {
    const bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
      add(x: number, y: number) {
        this.minX = Math.min(this.minX, x);
        this.minY = Math.min(this.minY, y);
        this.maxX = Math.max(this.maxX, x);
        this.maxY = Math.max(this.maxY, y);
      }
    };

    circleBounds(-Math.PI / 2, 0, 10, bounds as any);

    expect(bounds.minY).toBeCloseTo(-10, 6);
    expect(bounds.maxX).toBeCloseTo(10, 6);
  });

  test('pointsEqual supports both arrays and single points', () => {
    const p1 = { x: 1, y: 2, x1: 3, y1: 4, defined: true };
    const p2 = { x: 1, y: 2, x1: 3, y1: 4, defined: true };
    const p3 = { x: 1, y: 2, x1: 3, y1: 4, defined: false };

    expect(pointsEqual([p1] as any, [p2] as any)).toBe(true);
    expect(pointsEqual([p1] as any, [p3] as any)).toBe(false);

    expect(pointsEqual(p1 as any, p2 as any)).toBe(true);
    expect(pointsEqual({ x: 1, y: undefined } as any, p2 as any)).toBe(false);
    expect(pointsEqual(p1 as any, [p2] as any)).toBe(false);
  });

  test('pointsInterpolation aligns output length to pointsB and preserves defined from pointsB', () => {
    const a = [{ x: 0, y: 0, x1: 0, y1: 0, defined: true }];
    const b = [
      { x: 10, y: 20, x1: 10, y1: 20, defined: false },
      { x: 100, y: 200, x1: 100, y1: 200, defined: true },
      { x: -1, y: -2, x1: -1, y1: -2, defined: true }
    ];

    const out = pointsInterpolation(a as any, b as any, 0.5) as any[];

    expect(out).toHaveLength(3);
    expect(out[0].x).toBeCloseTo(5, 6);
    expect(out[0].y).toBeCloseTo(10, 6);
    expect(out[0].defined).toBe(false);

    // tail points are copied from pointsB when pointsA is shorter
    expect(out[1].x).toBe(100);
    expect(out[2].y).toBe(-2);
  });

  test('calculateLineHeight respects fontSize minimum and handles percent strings', () => {
    expect(calculateLineHeight(10 as any, 12)).toBe(12);
    expect(calculateLineHeight(14 as any, 12)).toBe(14);

    expect(calculateLineHeight('100%' as any, 12)).toBe(12);
    // 50% would be 6, but result is clamped to fontSize
    expect(calculateLineHeight('50%' as any, 12)).toBe(12);

    const nan = calculateLineHeight('abc%' as any, 12);
    expect(Number.isNaN(nan as any)).toBe(true);
  });
});
