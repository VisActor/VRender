import { Curve } from '../../../../../src/common/segment/curve/base';

describe('segment/curve/base', () => {
  class StubCurve extends Curve {
    p0: any = { x: 0, y: 0 };
    defined: boolean = true;

    calcLengthCalls = 0;
    calcProjLengthCalls = 0;

    getPointAt(): any {
      return { x: 0, y: 0 };
    }

    getAngleAt(): number {
      return 0;
    }

    getYAt(): number {
      return Infinity;
    }

    includeX(): boolean {
      return false;
    }

    protected calcLength(): number {
      this.calcLengthCalls += 1;
      return 123;
    }

    protected calcProjLength(): number {
      this.calcProjLengthCalls += 1;
      return 7;
    }

    draw(): void {
      return;
    }
  }

  test('getLength caches calcLength result when direction is not provided', () => {
    const c = new StubCurve();

    expect(c.getLength()).toBe(123);
    expect(c.getLength()).toBe(123);
    expect(c.calcLengthCalls).toBe(1);
  });

  test('getLength uses calcProjLength when direction is provided', () => {
    const c = new StubCurve();

    // populate cache
    expect(c.getLength()).toBe(123);

    expect(c.getLength('ROW' as any)).toBe(7);
    expect(c.calcProjLengthCalls).toBe(1);
    // direction branch should not require re-calc length
    expect(c.calcLengthCalls).toBe(1);
  });

  test('getLength recalculates when cached length is not finite', () => {
    const c: any = new StubCurve();

    c.length = NaN;
    expect(c.getLength()).toBe(123);
    expect(c.calcLengthCalls).toBe(1);
  });
});
