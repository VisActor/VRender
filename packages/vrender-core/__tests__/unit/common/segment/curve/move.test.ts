import { MoveCurve } from '../../../../../src/common/segment/curve/move';

describe('segment/curve/move', () => {
  test('draw calls path.moveTo using p1 with scaling and translation', () => {
    const curve = new MoveCurve({ x: 1, y: 2 } as any, { x: 3, y: 4 } as any);
    const path = {
      moveTo: jest.fn()
    };

    curve.draw(path as any, 10, 20, 2, 3, 0.5);

    expect(path.moveTo).toHaveBeenCalledTimes(1);
    expect(path.moveTo).toHaveBeenCalledWith(16, 32);
  });

  test('includeX returns false and getYAt returns Infinity', () => {
    const curve = new MoveCurve({ x: 0, y: 0 } as any, { x: 0, y: 0 } as any);

    expect(curve.includeX(-1)).toBe(false);
    expect(curve.includeX(0)).toBe(false);
    expect(curve.getYAt(0)).toBe(Infinity);
  });

  test('unimplemented methods throw', () => {
    const curve = new MoveCurve({ x: 0, y: 0 } as any, { x: 0, y: 0 } as any);

    expect(() => curve.getPointAt(0.5)).toThrow('MoveCurve暂不支持getPointAt');
    expect(() => curve.getAngleAt(0.5)).toThrow('暂不支持');
    expect(() => curve.getLength()).toThrow('暂不支持');
  });
});
