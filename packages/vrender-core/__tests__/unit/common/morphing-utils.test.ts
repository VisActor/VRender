import { alignBezierCurves, alignSubpath, centroidOfSubpath, cubicSubdivide } from '../../../src/common/morphing-utils';

describe('common/morphing-utils', () => {
  test('cubicSubdivide writes two segments', () => {
    const out: number[] = [];
    cubicSubdivide(0, 0, 10, 10, 0.5, out);

    expect(out).toHaveLength(8);
    expect(out[0]).toBe(0);
    expect(out[3]).toBeCloseTo(5);
    expect(out[4]).toBeCloseTo(5);
    expect(out[7]).toBe(10);
  });

  test('centroidOfSubpath returns first point for zero area', () => {
    const res = centroidOfSubpath([0, 0, 1, 0, 2, 0]);
    expect(res).toEqual([0, 0, 0]);
  });

  test('centroidOfSubpath returns center for a square', () => {
    const res = centroidOfSubpath([0, 0, 10, 0, 10, 10, 0, 10]);
    expect(res[0]).toBeCloseTo(5);
    expect(res[1]).toBeCloseTo(5);
    expect(res[2]).not.toBe(0);
  });

  test('alignSubpath expands shorter bezier array', () => {
    const oneBezier = [0, 0, 0, 0, 10, 0, 10, 0];
    const twoBeziers = [0, 0, 0, 0, 5, 0, 5, 0, 5, 0, 10, 0, 10, 0];

    const [a, b] = alignSubpath(oneBezier.slice(), twoBeziers.slice());

    expect(a.length).toBe(b.length);
    expect(a[a.length - 2]).toBeCloseTo(10);
    expect(a[a.length - 1]).toBeCloseTo(0);
  });

  test('alignBezierCurves creates missing subpath by repeating last point', () => {
    const s1 = [0, 0, 0, 0, 10, 0, 10, 0];
    const s2 = [0, 0, 0, 0, 10, 0, 10, 0];
    const s3 = [20, 0, 20, 0, 30, 0, 30, 0];

    const [a1, a2] = alignBezierCurves([s1], [s2, s3]);

    expect(a1).toHaveLength(2);
    expect(a2).toHaveLength(2);

    const created = a1[1];
    // should repeat last point of previous subpath
    expect(created[0]).toBe(s1[s1.length - 2]);
    expect(created[1]).toBe(s1[s1.length - 1]);
  });
});
