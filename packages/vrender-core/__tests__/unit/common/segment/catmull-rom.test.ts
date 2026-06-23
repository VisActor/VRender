import { Direction } from '../../../../src/common/enums';
import { SegContext } from '../../../../src/common/seg-context';
import { CatmullRom, genCatmullRomSegments } from '../../../../src/common/segment/catmull-rom';

describe('segment/catmull-rom', () => {
  test('genCatmullRomSegments returns null when not enough points', () => {
    expect(genCatmullRomSegments([] as any, 0.5)).toBeNull();
    expect(genCatmullRomSegments([{ x: 0, y: 0 }] as any, 0.5)).toBeNull();
  });

  test('genCatmullRomSegments falls back to linear when only 2 points', () => {
    const seg = genCatmullRomSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0 }
      ] as any,
      0.5
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(1);
    const endP = seg!.curves[0].p3 ?? seg!.curves[0].p1;
    expect(endP).toEqual({ x: 6, y: 0 });
  });

  test('genCatmullRomSegments produces cubic curves for 3 points', () => {
    const seg = genCatmullRomSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 12, y: 0 }
      ] as any,
      0.5
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves.some(c => c.p3)).toBe(true);
    const last = seg!.curves[seg!.curves.length - 1];
    const endP = last.p3 ?? last.p1;
    expect(endP).toEqual({ x: 12, y: 0 });
  });

  test('defined=false propagates into generated curves', () => {
    const seg = genCatmullRomSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0, defined: false },
        { x: 12, y: 0 }
      ] as any,
      0.5
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves.some(c => c.defined === false)).toBe(true);
  });

  test('handles repeated points without producing NaN control points', () => {
    const seg = genCatmullRomSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 6, y: 0 },
        { x: 12, y: 0 }
      ] as any,
      0.5
    );

    expect(seg).not.toBeNull();
    seg!.curves
      .filter(c => c.p3)
      .forEach(c => {
        // cubic bezier control points should be finite
        expect(Number.isFinite(c.p1.x)).toBe(true);
        expect(Number.isFinite(c.p1.y)).toBe(true);
        expect(Number.isFinite((c as any).p2.x)).toBe(true);
        expect(Number.isFinite((c as any).p2.y)).toBe(true);
        expect(Number.isFinite(c.p3.x)).toBe(true);
        expect(Number.isFinite(c.p3.y)).toBe(true);
      });
  });

  test('CatmullRom.lineEnd case 2 appends a line segment', () => {
    const ctx = new SegContext('catmullRom' as any, Direction.ROW as any);
    const c = new CatmullRom(ctx as any, 0.5);

    c.lineStart();
    c.point({ x: 0, y: 0 } as any);
    c.point({ x: 6, y: 0 } as any);
    c.lineEnd();

    expect(ctx.curves).toHaveLength(1);
    const endP = ctx.curves[0].p3 ?? ctx.curves[0].p1;
    expect(endP).toEqual({ x: 6, y: 0 });
  });

  test('CatmullRom.lineEnd case 3 appends an extra curve', () => {
    const ctx = new SegContext('catmullRom' as any, Direction.ROW as any);
    const c = new CatmullRom(ctx as any, 0.5);

    c.lineStart();
    c.point({ x: 0, y: 0 } as any);
    c.point({ x: 6, y: 0 } as any);
    c.point({ x: 12, y: 0 } as any);

    const before = ctx.curves.length;
    c.lineEnd();

    expect(ctx.curves.length).toBeGreaterThan(before);
  });
});
