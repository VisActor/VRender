import { drawPolygon, drawRoundedPolygon } from '../../../src/common/polygon';

type Call = { method: string; args: any[] };

class MockPath {
  calls: Call[] = [];

  moveTo(...args: any[]) {
    this.calls.push({ method: 'moveTo', args });
  }
  lineTo(...args: any[]) {
    this.calls.push({ method: 'lineTo', args });
  }
  arcTo(...args: any[]) {
    this.calls.push({ method: 'arcTo', args });
  }
}

describe('common/polygon', () => {
  test('drawPolygon is noop on empty points', () => {
    const path = new MockPath();
    drawPolygon(path as any, [], 0, 0);
    expect(path.calls).toEqual([]);
  });

  test('drawPolygon draws moveTo and lineTo for points', () => {
    const path = new MockPath();
    drawPolygon(
      path as any,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ],
      10,
      20
    );

    expect(path.calls[0]).toEqual({ method: 'moveTo', args: [10, 20] });
    expect(path.calls.filter(c => c.method === 'lineTo').length).toBe(2);
  });

  test('drawRoundedPolygon falls back to drawPolygon when points length < 3', () => {
    const path = new MockPath();
    drawRoundedPolygon(path as any, [{ x: 0, y: 0 }, { x: 10, y: 0 }], 0, 0, 2);
    expect(path.calls[0].method).toBe('moveTo');
    expect(path.calls.some(c => c.method === 'arcTo')).toBe(false);
  });

  test('drawRoundedPolygon clamps radius when segment > edge length', () => {
    const path = new MockPath();
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ];

    drawRoundedPolygon(path as any, points as any, 0, 0, 100);

    const arcCalls = path.calls.filter(c => c.method === 'arcTo');
    expect(arcCalls.length).toBeGreaterThan(0);

    // radius is the last arg of arcTo
    const maxRadius = Math.max(...arcCalls.map(c => c.args[c.args.length - 1]));
    expect(maxRadius).toBeLessThan(100);
  });

  test('drawRoundedPolygon with closePath=false draws final lineTo to last point', () => {
    const path = new MockPath();
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ];

    drawRoundedPolygon(path as any, points as any, 3, 4, 2, false);

    const last = path.calls[path.calls.length - 1];
    expect(last.method).toBe('lineTo');
    expect(last.args).toEqual([points[3].x + 3, points[3].y + 4]);
  });
});
