import { angleTo, length, normalize, scale } from '../../../src/util/matrix';

describe('util/matrix', () => {
  test('scale/length/normalize work', () => {
    expect(scale([2, -3], 2)).toEqual([4, -6]);
    expect(length([3, 4])).toBe(5);
    expect(normalize([0, 0])).toEqual([0, 0]);

    const n = normalize([3, 4]);
    expect(Math.sqrt(n[0] * n[0] + n[1] * n[1])).toBeCloseTo(1);
  });

  test('angleTo respects direct flag', () => {
    const v1: [number, number] = [1, 0];
    const v2: [number, number] = [0, 1];

    // crossProduct(v1,v2) >= 0
    expect(angleTo(v1, v2, true)).toBeCloseTo((Math.PI * 3) / 2);
    expect(angleTo(v1, v2, false)).toBeCloseTo(Math.PI / 2);

    const v3: [number, number] = [0, 1];
    const v4: [number, number] = [1, 0];

    // crossProduct(v3,v4) < 0
    expect(angleTo(v3, v4, true)).toBeCloseTo(Math.PI / 2);
    expect(angleTo(v3, v4, false)).toBeCloseTo((Math.PI * 3) / 2);
  });
});
