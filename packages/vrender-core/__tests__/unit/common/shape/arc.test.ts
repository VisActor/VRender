import { addArcToBezierPath, bezier, drawArc, segments } from '../../../../src/common/shape/arc';

describe('common/shape/arc', () => {
  test('segments returns finite params', () => {
    const segs = segments(100, 0, 1, 1, 0, 1, 0, 0, 0);
    expect(Array.isArray(segs)).toBe(true);
    expect(segs.length).toBeGreaterThan(0);

    segs.forEach(s => {
      expect(Array.isArray(s)).toBe(true);
      s.forEach(v => expect(Number.isFinite(v)).toBe(true));
    });
  });

  test('segments scales rx/ry when points are far apart', () => {
    const seg0 = segments(0, 0, 1, 1, 0, 1, 0, 100, 0)[0];
    expect(seg0[4]).toBeGreaterThan(1);
    expect(seg0[5]).toBeGreaterThan(1);
  });

  test('segments flips center when sweep equals large', () => {
    // Use large radii so sfactor_sq > 0 and flipping sfactor changes center.
    const segA = segments(100, 0, 1000, 1000, 0, 1, 0, 0, 0)[0];
    const segB = segments(100, 0, 1000, 1000, 1, 1, 0, 0, 0)[0];

    expect(segA[0] === segB[0] && segA[1] === segB[1]).toBe(false);
  });

  test('segments produces reverse angle when sweep=0 in typical cases', () => {
    const seg0 = segments(0, 1, 1, 1, 0, 0, 0, 1, 0)[0];
    expect(seg0[3]).toBeLessThan(seg0[2]);
  });

  test('bezier returns 6 numbers and all finite', () => {
    const seg0 = segments(50, 0, 30, 30, 0, 1, 0, 0, 0)[0];
    const b = bezier(seg0);
    expect(b).toHaveLength(6);
    b.forEach(v => expect(Number.isFinite(v)).toBe(true));
  });

  test('drawArc calls bezierCurveTo once per segment', () => {
    const ctx = {
      bezierCurveTo: jest.fn()
    };
    const x = 100;
    const y = 0;
    const coords = [1, 1, 0, 0, 1, 0, 0];

    const segs = segments(x, y, 1, 1, 0, 1, 0, 0, 0);
    drawArc(ctx as any, x, y, coords as any);

    expect(ctx.bezierCurveTo).toHaveBeenCalledTimes(segs.length);
  });

  test('addArcToBezierPath appends count*6 numbers', () => {
    const path: number[] = [];
    addArcToBezierPath(path, (3 * Math.PI) / 2, Math.PI / 2, 0, 0, 10, 10, false);

    // delta = pi => ceil(pi/(pi/2)) = 2 segments
    expect(path.length).toBe(12);
    path.forEach(v => expect(Number.isFinite(v)).toBe(true));
  });

  test('addArcToBezierPath supports counterclockwise', () => {
    const path: number[] = [];
    addArcToBezierPath(path, 0, Math.PI, 0, 0, 10, 10, true);

    expect(path.length).toBe(12);
    path.forEach(v => expect(Number.isFinite(v)).toBe(true));
  });
});
