import { Direction } from '../../../../src/common/enums';
import { SegContext } from '../../../../src/common/seg-context';
import { genLinearSegments, Linear } from '../../../../src/common/segment/linear';

describe('segment/linear', () => {
  test('genLinearSegments returns null when not enough points', () => {
    expect(genLinearSegments([] as any)).toBeNull();
    expect(genLinearSegments([{ x: 0, y: 0 }] as any)).toBeNull();
  });

  test('genLinearSegments supports startPoint with one point', () => {
    const seg = genLinearSegments([{ x: 1, y: 1 }] as any, { startPoint: { x: 0, y: 0 } as any });

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(1);
    expect(seg!.curves[0].p0.x).toBe(0);
    expect(seg!.curves[0].p0.y).toBe(0);
    expect(seg!.curves[0].p1.x).toBe(1);
    expect(seg!.curves[0].p1.y).toBe(1);
  });

  test('propagates defined=false from previous point', () => {
    const seg = genLinearSegments([
      { x: 0, y: 0, defined: false },
      { x: 1, y: 1 }
    ] as any);

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(1);
    expect(seg!.curves[0].defined).toBe(false);
  });

  test('propagates defined=false from current point', () => {
    const seg = genLinearSegments([
      { x: 0, y: 0 },
      { x: 1, y: 1, defined: false }
    ] as any);

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(1);
    expect(seg!.curves[0].defined).toBe(false);
  });

  test('Linear.lineEnd triggers closePath when _line is truthy', () => {
    const segContext = new SegContext('linear' as any, Direction.ROW as any);
    const linear = new Linear(segContext as any);

    linear.lineStart();
    linear.point({ x: 0, y: 0 } as any);
    linear.point({ x: 1, y: 0 } as any);
    linear.point({ x: 1, y: 1 } as any);

    // force closePath branch
    linear._line = 1;
    linear.lineEnd();

    expect(segContext.curves).toHaveLength(3);
    const lastCurve = segContext.curves[2];
    const endP = lastCurve.p3 ?? lastCurve.p1;
    expect(endP.x).toBe(0);
    expect(endP.y).toBe(0);
  });
});
