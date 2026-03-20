import { Direction } from '../../../../src/common/enums';
import { SegContext } from '../../../../src/common/seg-context';
import { Basis, genBasisSegments } from '../../../../src/common/segment/basis';

describe('segment/basis', () => {
  test('genBasisSegments returns null when not enough points', () => {
    expect(genBasisSegments([] as any)).toBeNull();
    expect(genBasisSegments([{ x: 0, y: 0 }] as any)).toBeNull();
  });

  test('genBasisSegments falls back to linear when only 2 points', () => {
    const seg = genBasisSegments(
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

  test('genBasisSegments produces cubic curves when there are 3 points', () => {
    const seg = genBasisSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 12, y: 0 }
      ] as any
    );

    expect(seg).not.toBeNull();
    // third point will produce 1 bezier, lineEnd will append another
    expect(seg!.curves.length).toBe(2);
    expect(seg!.curves.every(c => c.p3)).toBe(true);

    const last = seg!.curves[seg!.curves.length - 1];
    expect(last.p3).toEqual({ x: 12, y: 0 });
  });

  test('defined=false propagates into cubic curves', () => {
    const seg = genBasisSegments(
      [
        { x: 0, y: 0 },
        { x: 6, y: 0, defined: false },
        { x: 12, y: 0 }
      ] as any
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves.some(c => c.defined === false)).toBe(true);
  });

  test('Basis.lineEnd closes path when _line is truthy', () => {
    const ctx = new SegContext('basis' as any, Direction.ROW as any);
    const basis = new Basis(ctx as any);

    basis.lineStart();
    basis.point({ x: 0, y: 0 } as any);
    basis.point({ x: 6, y: 0 } as any);
    basis.point({ x: 12, y: 0 } as any);

    // force closePath branch
    basis._line = 1;
    basis.lineEnd();

    expect(ctx.curves.length).toBeGreaterThanOrEqual(3);
    const last = ctx.curves[ctx.curves.length - 1];
    const endP = last.p3 ?? last.p1;
    expect(endP).toEqual({ x: 0, y: 0 });
  });

  test('startPoint reduces threshold so 2 points can produce basis curves', () => {
    const seg = genBasisSegments([{ x: 6, y: 0 }, { x: 12, y: 0 }] as any, {
      startPoint: { x: 0, y: 0 } as any
    });

    expect(seg).not.toBeNull();
    expect(seg!.curves.some(c => c.p3)).toBe(true);
    const last = seg!.curves[seg!.curves.length - 1];
    const endP = last.p3 ?? last.p1;
    expect(endP).toEqual({ x: 12, y: 0 });
  });
});
