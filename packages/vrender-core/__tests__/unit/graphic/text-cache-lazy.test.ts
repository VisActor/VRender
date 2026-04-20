import { application } from '../../../src/application';
import { createText } from '../../../src/graphic/text';

describe('Text cache lazy init', () => {
  beforeEach(() => {
    (application as any).graphicUtil = {
      getTextMeasureInstance: jest.fn(() => ({
        measureTextWidth: (text: string) => text.length * 10,
        measureTextPixelHeight: () => 14,
        measureTextBoundHieght: () => 14,
        measureTextPixelADscentAndWidth: (text: string) => ({
          width: text.length * 10,
          ascent: 10,
          descent: 4
        }),
        clipText: (text: string, _options: unknown, width: number) => ({
          str: text,
          width: Math.min(text.length * 10, width)
        }),
        clipTextVertical: () => ({ verticalList: [], width: 0 }),
        clipTextWithSuffix: (text: string, _options: unknown, width: number) => ({
          str: text,
          width: Number.isFinite(width) ? Math.min(text.length * 10, width) : text.length * 10
        }),
        clipTextWithSuffixVertical: () => ({ verticalList: [], width: 0 }),
        measureText: (text: string) => ({ width: text.length * 10 })
      }))
    };
  });

  test('should not allocate cache during construction', () => {
    const text = createText({
      text: 'hello',
      fontSize: 12,
      fill: '#24292f'
    } as any);

    expect((text as any).cache).toBeUndefined();
  });

  test('should allocate cache when layout is first computed', () => {
    const text = createText({
      text: 'hello',
      fontSize: 12,
      fill: '#24292f'
    } as any);

    text.updateSingallineAABBBounds('hello');

    expect((text as any).cache).toBeDefined();
    expect((text as any).cache.layoutData).toBeDefined();
    expect((text as any).cache.clipedText).toBe('hello');
  });
});
