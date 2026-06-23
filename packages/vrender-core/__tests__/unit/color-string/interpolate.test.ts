import {
  _interpolateColor,
  colorStringInterpolationToStr,
  interpolateColor,
  interpolateGradientConicalColor,
  interpolateGradientLinearColor,
  interpolateGradientRadialColor,
  interpolatePureColorArray,
  interpolatePureColorArrayToStr
} from '../../../src/color-string/interpolate';

describe('vrender-core color-string interpolate', () => {
  test('interpolateColor supports string arrays', () => {
    const from = ['rgb(0,0,0)', 'rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)'] as any;
    const to = ['rgb(255,255,255)', 'rgb(0,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)'] as any;

    const out = interpolateColor(from, to, 0.5, false);

    expect(Array.isArray(out)).toBe(true);
    expect((out as any[]).length).toBe(4);
    for (const v of out as any[]) {
      expect(typeof v).toBe('string');
      expect(v.startsWith('rgb(')).toBe(true);
    }
  });

  test('_interpolateColor returns fallback when one side is missing', () => {
    expect(_interpolateColor(undefined as any, [0, 0, 0, 1], 0.5, false)).toBe('rgb(0,0,0)');
    expect(_interpolateColor([255, 0, 0, 1], undefined as any, 0.5, false)).toBe('rgb(255,0,0)');
    expect(_interpolateColor(undefined as any, undefined as any, 0.5, false)).toBe(false);
  });

  test('_interpolateColor invokes cb for pure colors and respects alphaChannel', () => {
    const cb = jest.fn();
    const out = _interpolateColor([0, 0, 0, 0], [255, 255, 255, 1], 0.5, true, cb);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(out).toBe('rgb(128,128,128,0.50)');
  });

  test('pure array helpers', () => {
    expect(interpolatePureColorArray([0, 0, 0, 0], [10, 20, 30, 1], 0.5)).toEqual([5, 10, 15, 0.5]);
    expect(interpolatePureColorArrayToStr([0, 0, 0, 0], [10, 20, 30, 1], 0.5)).toBe('rgba(5,10,15,0.5)');
    expect(colorStringInterpolationToStr('rgb(0,0,0)', 'rgb(255,255,255)', 0.5)).toBe('rgba(128,128,128,1)');
  });

  test('gradient interpolation: linear/radial/conical', () => {
    const fc = {
      gradient: 'linear' as const,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 10,
      stops: [
        { offset: 0, color: 'rgb(0,0,0)' },
        { offset: 1, color: 'rgb(255,255,255)' }
      ]
    };
    const tc = {
      gradient: 'linear' as const,
      x0: 10,
      x1: 10,
      y0: 10,
      y1: 20,
      stops: [
        { offset: 0, color: 'rgb(255,0,0)' },
        { offset: 1, color: 'rgb(0,0,255)' }
      ]
    };

    const l = interpolateGradientLinearColor(fc as any, tc as any, 0.5) as any;
    expect(l.gradient).toBe('linear');
    expect(l.x0).toBe(5);
    expect(l.y1).toBe(15);
    expect(l.stops[0].color.startsWith('rgba(')).toBe(true);

    const fr = {
      gradient: 'radial' as const,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0,
      r0: 0,
      r1: 10,
      stops: fc.stops
    };
    const tr = {
      gradient: 'radial' as const,
      x0: 10,
      x1: 10,
      y0: 10,
      y1: 10,
      r0: 5,
      r1: 15,
      stops: tc.stops
    };
    const r = interpolateGradientRadialColor(fr as any, tr as any, 0.5) as any;
    expect(r.gradient).toBe('radial');
    expect(r.r0).toBe(2.5);
    expect(r.r1).toBe(12.5);

    const fcon = {
      gradient: 'conical' as const,
      startAngle: 0,
      endAngle: 1,
      x: 0,
      y: 0,
      stops: fc.stops
    };
    const tcon = {
      gradient: 'conical' as const,
      startAngle: 1,
      endAngle: 3,
      x: 10,
      y: 10,
      stops: tc.stops
    };
    const c = interpolateGradientConicalColor(fcon as any, tcon as any, 0.5) as any;
    expect(c.gradient).toBe('conical');
    expect(c.startAngle).toBe(0.5);
    expect(c.endAngle).toBe(2);
  });

  test('_interpolateColor handles pure/gradient conversion and stop mismatch', () => {
    const gradient = {
      gradient: 'linear' as const,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 10,
      stops: [
        { offset: 0, color: 'rgb(0,0,0)' },
        { offset: 1, color: 'rgb(255,255,255)' }
      ]
    };

    const asGradient = _interpolateColor(gradient as any, 'rgb(255,0,0)' as any, 1, false) as any;
    expect(asGradient.gradient).toBe('linear');
    expect(asGradient.stops[0].color).toBe('rgba(255,0,0,1)');

    const mismatch = _interpolateColor(
      gradient as any,
      { ...gradient, stops: [{ offset: 0, color: 'rgb(0,0,0)' }] } as any,
      0.5,
      false
    );
    expect(mismatch).toBe(false);
  });
});
