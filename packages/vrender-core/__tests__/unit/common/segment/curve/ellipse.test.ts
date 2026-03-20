import { EllipseCurve } from '../../../../../src/common/segment/curve/ellipse';

describe('segment/curve/ellipse', () => {
  test('constructor assigns fields', () => {
    const p0 = { x: 1, y: 2 };
    const c = new EllipseCurve(p0 as any, 10, 20, 0.1, 0, Math.PI, true);

    expect(c.p0).toBe(p0);
    expect((c as any).radiusX).toBe(10);
    expect((c as any).radiusY).toBe(20);
    expect((c as any).rotation).toBe(0.1);
    expect((c as any).startAngle).toBe(0);
    expect((c as any).endAngle).toBe(Math.PI);
    expect((c as any).anticlockwise).toBe(true);
  });

  test('unimplemented methods throw', () => {
    const c = new EllipseCurve({ x: 0, y: 0 } as any, 1, 2, 0, 0, 1);

    expect(() => c.getPointAt(0.5)).toThrow('暂不支持');
    expect(() => c.getAngleAt(0.5)).toThrow('暂不支持');
    expect(() => c.draw({} as any, 1 as any)).toThrow('暂不支持');
    expect(() => c.getLength()).toThrow('暂不支持');
  });
});
