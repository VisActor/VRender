import { Direction } from '../../../../src/common/enums';
import { SegContext } from '../../../../src/common/seg-context';
import { MonotoneX, genMonotoneXSegments, genMonotoneYSegments } from '../../../../src/common/segment/monotone';

describe('segment/monotone', () => {
  test('genMonotoneXSegments returns null when not enough points', () => {
    expect(genMonotoneXSegments([] as any)).toBeNull();
    expect(genMonotoneXSegments([{ x: 0, y: 0 }] as any)).toBeNull();
  });

  test('genMonotoneXSegments falls back to linear when only 2 points', () => {
    const seg = genMonotoneXSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0 }
      ] as any
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(1);
    const endP = seg!.curves[0].p3 ?? seg!.curves[0].p1;
    expect(endP).toEqual({ x: 6, y: 0 });
  });

  test('genMonotoneXSegments produces cubic curves for 3 points', () => {
    const seg = genMonotoneXSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 12, y: 0 }
      ] as any
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves.some(c => c.p3)).toBe(true);
    const last = seg!.curves[seg!.curves.length - 1];
    const endP = last.p3 ?? last.p1;
    expect(endP).toEqual({ x: 12, y: 0 });
  });

  test('defined=false propagates into generated curves', () => {
    const seg = genMonotoneXSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0, defined: false },
        { x: 12, y: 0 }
      ] as any
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves.some(c => c.defined === false)).toBe(true);
  });

  test('MonotoneX.lineEnd case 2 appends a line segment', () => {
    const ctx = new SegContext('monotoneX' as any, Direction.ROW as any);
    const m = new MonotoneX(ctx as any);

    m.lineStart();
    m.point({ x: 0, y: 0 } as any);
    m.point({ x: 6, y: 0 } as any);
    m.lineEnd();

    expect(ctx.curves).toHaveLength(1);
    const endP = ctx.curves[0].p3 ?? ctx.curves[0].p1;
    expect(endP).toEqual({ x: 6, y: 0 });
  });

  test('MonotoneX.lineEnd case 3 appends an extra curve', () => {
    const ctx = new SegContext('monotoneX' as any, Direction.ROW as any);
    const m = new MonotoneX(ctx as any);

    m.lineStart();
    m.point({ x: 0, y: 0 } as any);
    m.point({ x: 6, y: 0 } as any);
    m.point({ x: 12, y: 0 } as any);

    const before = ctx.curves.length;
    m.lineEnd();

    expect(ctx.curves.length).toBeGreaterThan(before);
  });

  test('genMonotoneYSegments keeps final point y-increasing', () => {
    const seg = genMonotoneYSegments(
      [
        { x: 0, y: 0 },
        { x: 0, y: 6 },
        { x: 0, y: 12 }
      ] as any
    );

    expect(seg).not.toBeNull();
    const last = seg!.curves[seg!.curves.length - 1];
    const endP = last.p3 ?? last.p1;
    expect(endP).toEqual({ x: 0, y: 12 });
  });
});
