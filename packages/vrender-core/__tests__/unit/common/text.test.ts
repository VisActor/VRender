import { textAttributesToStyle, textDrawOffsetX, textDrawOffsetY, textLayoutOffsetY } from '../../../src/common/text';

describe('common/text', () => {
  test('textDrawOffsetY handles baselines', () => {
    expect(textDrawOffsetY('top' as any, 100)).toBe(Math.ceil(0.79 * 100));
    expect(textDrawOffsetY('middle' as any, 100)).toBe(Math.round(0.3 * 100));
    expect(textDrawOffsetY('bottom' as any, 100)).toBe(Math.round(-0.21 * 100));
    expect(textDrawOffsetY('alphabetic' as any, 100)).toBe(0);
  });

  test('textDrawOffsetX handles align', () => {
    expect(textDrawOffsetX('right' as any, 10)).toBe(-10);
    expect(textDrawOffsetX('end' as any, 10)).toBe(-10);
    expect(textDrawOffsetX('center' as any, 10)).toBe(-5);
    expect(textDrawOffsetX('left' as any, 10)).toBe(0);
  });

  test('textLayoutOffsetY handles baseline and fontSize fallback', () => {
    expect(textLayoutOffsetY('middle' as any, 20, 12)).toBe(-10);
    expect(textLayoutOffsetY('top' as any, 20, 12)).toBe(0);
    expect(textLayoutOffsetY('bottom' as any, 20, 12, 3)).toBe(3 - 20);

    // baseline alphabetic, fontSize fallback to lineHeight
    expect(textLayoutOffsetY('alphabetic' as any, 20, 0)).toBe(-(20 - 20) / 2 - 0.79 * 20);
  });

  test('textAttributesToStyle maps attributes to css-like style', () => {
    const style = textAttributesToStyle({
      textAlign: 'center',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 12,
      lineHeight: '14px',
      maxLineWidth: 100,
      underline: true,
      lineThrough: true,
      fill: '#fff'
    } as any);

    expect(style).toEqual(
      expect.objectContaining({
        'text-align': 'center',
        'font-family': 'Arial',
        'font-weight': 'bold',
        'font-size': '12px',
        'line-height': '14px',
        'max-width': '100px',
        'text-decoration': 'underline',
        color: '#fff'
      })
    );
  });

  test('textAttributesToStyle ignores non-string fill', () => {
    const style = textAttributesToStyle({ fill: { gradient: true } } as any);
    expect(style.color).toBeUndefined();
  });
});
