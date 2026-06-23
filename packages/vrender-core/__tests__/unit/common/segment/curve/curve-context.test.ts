import { CurveContext } from '../../../../../src/common/segment/curve/curve-context';
import { CubicBezierCurve } from '../../../../../src/common/segment/curve/cubic-bezier';
import { LineCurve } from '../../../../../src/common/segment/curve/line';
import { QuadraticBezierCurve } from '../../../../../src/common/segment/curve/quadratic-bezier';

describe('segment/curve/curve-context', () => {
  function createPath() {
    const curves: any[] = [];
    return {
      curves,
      addCurve: (c: any) => curves.push(c)
    };
  }

  test('lineTo creates a LineCurve and chains from previous point', () => {
    const path = createPath();
    const ctx = new CurveContext(path as any);

    ctx.moveTo(0, 0).lineTo(1, 0);
    ctx.lineTo(1, 1);

    expect(path.curves).toHaveLength(2);
    expect(path.curves[0]).toBeInstanceOf(LineCurve);
    expect(path.curves[0].p0).toEqual({ x: 0, y: 0 });
    expect(path.curves[0].p1).toEqual({ x: 1, y: 0 });

    expect(path.curves[1].p0).toEqual({ x: 1, y: 0 });
    expect(path.curves[1].p1).toEqual({ x: 1, y: 1 });
  });

  test('quadraticCurveTo creates QuadraticBezierCurve and updates last point', () => {
    const path = createPath();
    const ctx = new CurveContext(path as any);

    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(5, 10, 10, 0);
    ctx.lineTo(20, 0);

    expect(path.curves[0]).toBeInstanceOf(QuadraticBezierCurve);
    expect(path.curves[0].p0).toEqual({ x: 0, y: 0 });
    expect(path.curves[0].p1).toEqual({ x: 5, y: 10 });
    expect(path.curves[0].p2).toEqual({ x: 10, y: 0 });

    expect(path.curves[1]).toBeInstanceOf(LineCurve);
    expect(path.curves[1].p0).toEqual({ x: 10, y: 0 });
  });

  test('bezierCurveTo creates CubicBezierCurve', () => {
    const path = createPath();
    const ctx = new CurveContext(path as any);

    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, 10, 10, 10, 10, 0);

    expect(path.curves).toHaveLength(1);
    expect(path.curves[0]).toBeInstanceOf(CubicBezierCurve);
    expect(path.curves[0].p0).toEqual({ x: 0, y: 0 });
    expect(path.curves[0].p3).toEqual({ x: 10, y: 0 });
  });

  test('closePath returns early when curves length < 2', () => {
    const path = createPath();
    const ctx = new CurveContext(path as any);

    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0);
    ctx.closePath();

    expect(path.curves).toHaveLength(1);
  });

  test('closePath appends closing line when curves length >= 2', () => {
    const path = createPath();
    const ctx = new CurveContext(path as any);

    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0);
    ctx.lineTo(1, 1);
    ctx.closePath();

    expect(path.curves).toHaveLength(3);
    const last = path.curves[2];
    expect(last).toBeInstanceOf(LineCurve);
    expect(last.p1).toEqual({ x: 0, y: 0 });
  });

  test('unsupported apis throw', () => {
    const path = createPath();
    const ctx = new CurveContext(path as any);

    expect(() => ctx.arcTo(0, 0, 1, 1, 2)).toThrow('CurveContext不支持调用arcTo');
    expect(() => ctx.ellipse(0, 0, 1, 1, 0, 0, 1, false)).toThrow('CurveContext不支持调用ellipse');
    expect(() => ctx.rect(0, 0, 1, 1)).toThrow('CurveContext不支持调用rect');
    expect(() => ctx.arc(0, 0, 1, 0, 1)).toThrow('CurveContext不支持调用arc');
  });
});
