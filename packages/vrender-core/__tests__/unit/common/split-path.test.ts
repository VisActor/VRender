import { binarySplitPolygon, recursiveCallBinarySplit, splitPolygon, splitToGrids } from '../../../src/common/split-path';

describe('common/split-path', () => {
  test('splitToGrids sums to count (width >= height)', () => {
    const grids = splitToGrids(100, 50, 10);
    expect(grids.reduce((s, v) => s + v, 0)).toBe(10);
    expect(grids.every(v => v > 0)).toBe(true);
  });

  test('splitToGrids sums to count (width < height)', () => {
    const grids = splitToGrids(50, 100, 10);
    expect(grids.reduce((s, v) => s + v, 0)).toBe(10);
    expect(grids.every(v => v > 0)).toBe(true);
  });

  test('binarySplitPolygon splits a rectangle into two polygons', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ];

    const [a, b] = binarySplitPolygon(points as any);

    expect(a.length).toBeGreaterThan(2);
    expect(b.length).toBeGreaterThan(2);

    const xs = [...a, ...b].map(p => p.x);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(10);
  });

  test('recursiveCallBinarySplit outputs correct count', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];

    const out: { points: any[] }[] = [];
    recursiveCallBinarySplit(points as any, 3, out);
    expect(out).toHaveLength(3);
    out.forEach(item => expect(item.points.length).toBeGreaterThan(2));
  });

  test('splitPolygon clones points when count=1', () => {
    const polygon = {
      attribute: {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 }
        ]
      }
    };

    const res = splitPolygon(polygon as any, 1);
    expect(res).toHaveLength(1);
    expect(res[0].points).not.toBe(polygon.attribute.points);
    expect(res[0].points).toEqual(polygon.attribute.points);
  });
});
