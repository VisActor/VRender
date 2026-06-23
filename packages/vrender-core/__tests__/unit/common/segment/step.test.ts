import { genStepClosedSegments, genStepSegments } from '../../../../src/common/segment/step';

describe('segment/step', () => {
  test('genStepSegments returns null when not enough points', () => {
    expect(genStepSegments([] as any, 0.5)).toBeNull();
    expect(genStepSegments([{ x: 0, y: 0 }] as any, 0.5)).toBeNull();
  });

  test('t<=0 produces stepBefore shape', () => {
    const seg = genStepSegments(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ] as any,
      0
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(2);
    expect(seg!.curves[0].p1.x).toBe(0);
    expect(seg!.curves[0].p1.y).toBe(10);
    expect(seg!.curves[1].p1.x).toBe(10);
    expect(seg!.curves[1].p1.y).toBe(10);
  });

  test('t=1 produces stepAfter shape', () => {
    const seg = genStepSegments(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ] as any,
      1
    );

    expect(seg).not.toBeNull();
    expect(seg!.curves).toHaveLength(2);
    expect(seg!.curves[0].p1.x).toBe(10);
    expect(seg!.curves[0].p1.y).toBe(0);
    expect(seg!.curves[1].p1.x).toBe(10);
    expect(seg!.curves[1].p1.y).toBe(10);
  });

  test('t=0.5 uses special defined logic and lineEnd append', () => {
    const seg = genStepSegments(
      [
        { x: 0, y: 0, defined: true },
        { x: 10, y: 10, defined: false }
      ] as any,
      0.5
    );

    expect(seg).not.toBeNull();
    // 2 segments from point + 1 segment from lineEnd
    expect(seg!.curves).toHaveLength(3);
    expect(seg!.curves[0].defined).toBe(true);
    expect(seg!.curves[1].defined).toBe(false);
    expect(seg!.curves[2].defined).toBe(false);

    const lastCurve = seg!.curves[2];
    const endP = lastCurve.p3 ?? lastCurve.p1;
    expect(endP.x).toBe(10);
    expect(endP.y).toBe(10);
  });

  test('genStepClosedSegments closes path via closePath', () => {
    const seg = genStepClosedSegments(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ] as any,
      0.5
    );

    expect(seg).not.toBeNull();
    // 2 segments from point + closePath segment
    expect(seg!.curves).toHaveLength(3);

    const lastCurve = seg!.curves[2];
    const endP = lastCurve.p3 ?? lastCurve.p1;
    expect(endP.x).toBe(0);
    expect(endP.y).toBe(0);
  });
});
