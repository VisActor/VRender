import { GradientParser } from '../../../src/common/color-utils';

describe('common/color-utils', () => {
  test('IsGradient / IsGradientStr', () => {
    expect(GradientParser.IsGradient('#fff' as any)).toBe(false);
    expect(GradientParser.IsGradient('linear-gradient(0deg, #fff, #000)' as any)).toBe(true);
    expect(GradientParser.IsGradient({ gradient: 'linear' } as any)).toBe(true);

    expect(GradientParser.IsGradientStr('#fff' as any)).toBe(false);
    expect(GradientParser.IsGradientStr('radial-gradient(red, blue)' as any)).toBe(true);
    expect(GradientParser.IsGradientStr({} as any)).toBe(false);
  });

  test('processColorStops handles empty and uniform distribution', () => {
    expect(GradientParser.processColorStops([] as any)).toEqual([]);

    expect(
      GradientParser.processColorStops([{ value: 'red' }, { value: 'blue' }] as any).map(s => s.offset)
    ).toEqual([0, 1]);

    expect(
      GradientParser.processColorStops([{ value: 'red' }, { value: 'green' }, { value: 'blue' }] as any).map(s => s.offset)
    ).toEqual([0, 0.5, 1]);
  });

  test('processColorStops fills missing offsets using head/tail defaults', () => {
    const stops = GradientParser.processColorStops(
      [{ value: 'red' }, { value: 'green', length: { value: '30' } }, { value: 'blue' }] as any
    );

    expect(stops).toEqual([
      { color: 'red', offset: 0 },
      { color: 'green', offset: 0.3 },
      { color: 'blue', offset: 1 }
    ]);
  });

  test('processColorStops interpolates consecutive missing offsets', () => {
    const stops = GradientParser.processColorStops(
      [
        { value: 'red', length: { value: '0' } },
        { value: 'a' },
        { value: 'b' },
        { value: 'blue', length: { value: '100' } }
      ] as any
    );

    expect(stops[0]).toEqual({ color: 'red', offset: 0 });
    expect(stops[1].offset).toBeCloseTo(1 / 3);
    expect(stops[2].offset).toBeCloseTo(2 / 3);
    expect(stops[3]).toEqual({ color: 'blue', offset: 1 });
  });

  test('Parse returns original value for non-gradient or invalid gradient', () => {
    expect(GradientParser.Parse('#123456' as any)).toBe('#123456');
    expect(GradientParser.Parse('linear-gradient(' as any)).toBe('linear-gradient(');
  });

  test('Parse handles linear/radial/conic gradients', () => {
    const linear = GradientParser.Parse('linear-gradient(0deg, red 0%, blue 100%)' as any) as any;
    expect(linear.gradient).toBe('linear');
    expect(linear.x0).toBeCloseTo(0);
    expect(linear.y0).toBeCloseTo(1);
    expect(linear.x1).toBeCloseTo(0);
    expect(linear.y1).toBeCloseTo(0);
    expect(linear.stops).toEqual([
      { color: 'red', offset: 0 },
      { color: 'blue', offset: 1 }
    ]);

    const radial = GradientParser.Parse('radial-gradient(red, blue)' as any) as any;
    expect(radial.gradient).toBe('radial');
    expect(radial.x0).toBe(0.5);
    expect(radial.r0).toBe(0);
    expect(radial.r1).toBe(1);

    const conic = GradientParser.Parse('conic-gradient(from 0deg, red, blue)' as any) as any;
    expect(conic.gradient).toBe('conical');
    expect(conic.x).toBe(0.5);
    expect(conic.y).toBe(0.5);
    expect(conic.endAngle - conic.startAngle).toBeCloseTo(Math.PI * 2);
  });
});
