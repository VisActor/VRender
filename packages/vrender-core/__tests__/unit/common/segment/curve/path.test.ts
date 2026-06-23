import { CurvePath } from '../../../../../src/common/segment/curve/path';

describe('segment/curve/path', () => {
  test('getCurveLengths maps curves getLength', () => {
    const cp: any = new CurvePath();

    const c1 = { getLength: jest.fn(() => 10) };
    const c2 = { getLength: jest.fn(() => 20) };
    cp._curves.push(c1, c2);

    expect(cp.getCurveLengths()).toEqual([10, 20]);
    expect(c1.getLength).toHaveBeenCalledTimes(1);
    expect(c2.getLength).toHaveBeenCalledTimes(1);
  });

  test('placeholder methods return default values', () => {
    const cp = new CurvePath();

    expect(cp.getLength()).toBe(0);
    expect(cp.getPointAt(0.5)).toEqual({ x: 0, y: 0 });
  });
});
