import { ArcCurve } from '../../../../../src/common/segment/curve/arc';

describe('segment/curve/arc', () => {
  test('constructor assigns fields', () => {
    const p0 = { x: 1, y: 2 };
    const p1 = { x: 3, y: 4 };
    const c = new ArcCurve(p0 as any, p1 as any, 10);

    expect(c.p0).toBe(p0);
    expect((c as any).p1).toBe(p1);
    expect((c as any).radius).toBe(10);
  });

  test('unimplemented methods throw', () => {
    const c = new ArcCurve({ x: 0, y: 0 } as any, { x: 1, y: 1 } as any, 1);

    expect(() => c.getPointAt(0.5)).toThrow('暂不支持');
    expect(() => c.getAngleAt(0.5)).toThrow('暂不支持');
    expect(() => c.draw({} as any, 1 as any)).toThrow('暂不支持');
    expect(() => c.getLength()).toThrow('暂不支持');
  });
});
