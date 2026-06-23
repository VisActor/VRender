import { halfPi, tau } from '@visactor/vutils';
import { BoundsContext } from '../../../src/common/bounds-context';

type Point = { x: number; y: number };

function createMockBounds() {
  const points: Point[] = [];

  const bounds = {
    add: jest.fn((x: number, y: number) => {
      points.push({ x, y });
    }),
    clear: jest.fn(() => {
      points.length = 0;
    })
  };

  const getAABB = () => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  };

  return { bounds: bounds as any, points, getAABB };
}

describe('BoundsContext', () => {
  test('arc uses fast path for full circle', () => {
    const { bounds, points } = createMockBounds();
    const ctx = new BoundsContext(bounds);

    ctx.arc(10, 20, 5, 0, tau, false);

    expect(points).toEqual([
      { x: 5, y: 15 },
      { x: 15, y: 25 }
    ]);
  });

  test('arc computes quadrant AABB for 0 -> PI/2', () => {
    const { bounds, getAABB } = createMockBounds();
    const ctx = new BoundsContext(bounds);

    ctx.arc(0, 0, 10, 0, halfPi, false);

    const aabb = getAABB();
    expect(aabb.minX).toBeCloseTo(0, 6);
    expect(aabb.minY).toBeCloseTo(0, 6);
    expect(aabb.maxX).toBeCloseTo(10, 6);
    expect(aabb.maxY).toBeCloseTo(10, 6);
  });

  test('arcTo only adds the first control point', () => {
    const { bounds } = createMockBounds();
    const ctx = new BoundsContext(bounds);

    ctx.arcTo(1, 2, 100, 200, 5);

    expect(bounds.add).toHaveBeenCalledTimes(1);
    expect(bounds.add).toHaveBeenCalledWith(1, 2);
  });

  test('bezierCurveTo adds both control points and end point', () => {
    const { bounds } = createMockBounds();
    const ctx = new BoundsContext(bounds);

    ctx.bezierCurveTo(1, 2, 3, 4, 5, 6);

    expect(bounds.add).toHaveBeenCalledTimes(3);
    expect(bounds.add).toHaveBeenNthCalledWith(1, 1, 2);
    expect(bounds.add).toHaveBeenNthCalledWith(2, 3, 4);
    expect(bounds.add).toHaveBeenNthCalledWith(3, 5, 6);
  });

  test('ellipse throws as not supported', () => {
    const { bounds } = createMockBounds();
    const ctx = new BoundsContext(bounds);

    expect(() => (ctx as any).ellipse()).toThrow('不支持ellipse');
  });

  test('clear delegates to bounds.clear', () => {
    const { bounds } = createMockBounds();
    const ctx = new BoundsContext(bounds);

    ctx.clear();
    expect(bounds.clear).toHaveBeenCalledTimes(1);
  });
});
