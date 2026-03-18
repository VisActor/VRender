import { Easing } from '../../../src/utils/easing';

describe('vrender-animate Easing', () => {
  test('none() returns linear easing', () => {
    expect(Easing.none()(0.3)).toBeCloseTo(0.3);
  });

  test('get(amount) clamps and returns different curves', () => {
    const linear = Easing.get(0);
    expect(linear(0.2)).toBeCloseTo(0.2);

    const inCurve = Easing.get(-2); // clamp to -1
    expect(inCurve(0.5)).toBeCloseTo(0.25);

    const outCurve = Easing.get(2); // clamp to 1
    expect(outCurve(0.5)).toBeCloseTo(0.75);
  });

  test('getPowInOut has two branches', () => {
    const fn = Easing.getPowInOut(2);
    expect(fn(0.25)).toBeCloseTo(0.125);
    expect(fn(0.75)).toBeCloseTo(0.875);
  });

  test('expo/circ have edge branches', () => {
    expect(Easing.expoIn(0)).toBe(0);
    expect(Easing.expoOut(1)).toBe(1);
    expect(Easing.expoInOut(0)).toBe(0);
    expect(Easing.expoInOut(1)).toBe(1);

    expect(Easing.circInOut(0.25)).toBeLessThan(0.5);
    expect(Easing.circInOut(0.75)).toBeGreaterThan(0.5);
  });

  test('bounceOut covers all segments', () => {
    const t1 = 0.1;
    const t2 = 1.8 / 2.75;
    const t3 = 2.3 / 2.75;
    const t4 = 2.7 / 2.75;

    expect(Easing.bounceOut(t1)).toBeCloseTo(7.5625 * t1 * t1);
    expect(Easing.bounceOut(t2)).toBeGreaterThan(0.5);
    expect(Easing.bounceOut(t3)).toBeGreaterThan(0.8);
    expect(Easing.bounceOut(t4)).toBeGreaterThan(0.9);
  });

  test('bounceInOut has two branches', () => {
    const a = Easing.bounceInOut(0.25);
    const b = Easing.bounceInOut(0.75);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(1);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThanOrEqual(1);
  });

  test('elastic easings handle t=0/1 shortcuts', () => {
    const fin = Easing.getElasticIn(1, 0.3);
    const fout = Easing.getElasticOut(1, 0.3);

    expect(fin(0)).toBe(0);
    expect(fin(1)).toBe(1);
    expect(fout(0)).toBe(0);
    expect(fout(1)).toBe(1);
  });

  test('registerFunc adds easing dynamically', () => {
    Easing.registerFunc('customEase', (t: number) => t * t);
    expect((Easing as any).customEase(0.2)).toBeCloseTo(0.04);
  });

  test('auto-registered functions are callable', () => {
    const flicker = (Easing as any).flicker5(0.6);
    expect(flicker).toBeGreaterThanOrEqual(0);
    expect(flicker).toBeLessThanOrEqual(1);

    // aIn2: i*t*t + (1-i)*t
    expect((Easing as any).aIn2(0.5)).toBeCloseTo(0);
  });
});
