import { genLinearClosedSegments } from '../../../../src/common/segment/linear-closed';

describe('segment/linear-closed', () => {
  test('returns null when not enough points', () => {
    expect(genLinearClosedSegments([] as any)).toBeNull();
    expect(genLinearClosedSegments([{ x: 0, y: 0 }] as any)).toBeNull();
  });

  test('closes path when there are at least 3 points', () => {
    const seg = genLinearClosedSegments([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ] as any);

    expect(seg).not.toBeNull();
    // 2 segments + closePath
    expect(seg!.curves).toHaveLength(3);
    const lastCurve = seg!.curves[2];
    const endP = lastCurve.p3 ?? lastCurve.p1;
    expect(endP.x).toBe(0);
    expect(endP.y).toBe(0);
  });
});
