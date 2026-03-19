import {
  identityMat4,
  lookAt,
  ortho,
  rotateZ,
  transformMat4,
  translate
} from '../../../src/common/matrix';

type Mat4 = number[];

describe('common/matrix', () => {
  test('identityMat4 writes identity', () => {
    const out: Mat4 = new Array(16).fill(-1);
    identityMat4(out as any);
    expect(out).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  test('rotateZ works when a !== out', () => {
    const a: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const out: Mat4 = new Array(16).fill(0);
    rotateZ(out as any, a as any, Math.PI / 2);

    expect(out[0]).toBeCloseTo(0);
    expect(out[1]).toBeCloseTo(1);
    expect(out[4]).toBeCloseTo(-1);
    expect(out[5]).toBeCloseTo(0);
  });

  test('rotateZ works when a === out', () => {
    const out: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    rotateZ(out as any, out as any, 0.5);
    expect(out[0]).not.toBe(1);
    expect(out[5]).not.toBe(1);
  });

  test('translate handles both branches', () => {
    const a1: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const out1: Mat4 = new Array(16).fill(0);
    translate(out1 as any, a1 as any, [10, 20, 30] as any);
    expect(out1[12]).toBe(10);
    expect(out1[13]).toBe(20);
    expect(out1[14]).toBe(30);

    const out2: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    translate(out2 as any, out2 as any, [1, 2, 3] as any);
    expect(out2[12]).toBe(1);
    expect(out2[13]).toBe(2);
    expect(out2[14]).toBe(3);
  });

  test('lookAt returns identity when eye equals center', () => {
    const out: Mat4 = new Array(16).fill(42);
    lookAt(out as any, [1, 2, 3] as any, [1, 2, 3] as any, [0, 1, 0] as any);
    expect(out).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  test('lookAt handles zero up vector', () => {
    const out: Mat4 = new Array(16).fill(0);
    lookAt(out as any, [0, 0, 1] as any, [0, 0, 0] as any, [0, 0, 0] as any);

    expect(out[15]).toBe(1);
    // should not produce NaN
    out.forEach(v => expect(Number.isNaN(v)).toBe(false));
  });

  test('ortho & transformMat4 works with w=0 fallback', () => {
    const out: Mat4 = new Array(16).fill(0);
    ortho(out as any, -1, 1, -1, 1, 0, 1);
    expect(out[0]).toBeCloseTo(1);
    expect(out[5]).toBeCloseTo(1);
    expect(out[15]).toBe(1);

    const m: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
    const v = [1, 2, 3] as any;
    const tv: number[] = [0, 0, 0];
    transformMat4(tv as any, v, m as any);
    expect(tv).toEqual([1, 2, 3]);
  });
});
