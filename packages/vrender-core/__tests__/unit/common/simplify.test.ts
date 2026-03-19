import { flatten_simplify } from '../../../src/common/simplify';

describe('common/simplify', () => {
  test('returns original array when points length <= 10', () => {
    const points = Array.from({ length: 10 }, (_, i) => ({ x: i, y: 0 }));
    expect(flatten_simplify(points as any, 1, false)).toBe(points as any);
  });

  test('highestQuality=true skips simplification', () => {
    const points = Array.from({ length: 11 }, (_, i) => ({ x: i * 0.1, y: 0 }));
    expect(flatten_simplify(points as any, 0.1, true)).toBe(points as any);
  });

  test('radial distance removes near points and keeps last point', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0.2, y: 0 },
      { x: 0.4, y: 0 },
      { x: 0.6, y: 0 },
      { x: 0.8, y: 0 },
      { x: 0.9, y: 0 },
      { x: 0.92, y: 0 },
      { x: 0.94, y: 0 },
      { x: 0.96, y: 0 },
      { x: 0.98, y: 0 },
      { x: 1, y: 0 }
    ];

    const simplified = flatten_simplify(points as any, 0.1, false);
    expect(simplified.map(p => p.x)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 0.92, 1]);
  });
});
