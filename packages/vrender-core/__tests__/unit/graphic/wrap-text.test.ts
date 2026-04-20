import { application } from '../../../src/application';
import { CanvasTextLayout } from '../../../src/core/contributions/textMeasure/layout';
import { createWrapText } from '../../../src/graphic/wrap-text';

describe('WrapText layout', () => {
  beforeEach(() => {
    (application as any).graphicUtil = {
      getTextMeasureInstance: jest.fn(() => ({
        id: 'mock-text-measure',
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
    (application as any).graphicService = {
      updateTempAABBBounds: jest.fn((aabbBounds: any) => ({
        tb1: aabbBounds,
        tb2: aabbBounds
      })),
      combindShadowAABBBounds: jest.fn(),
      updateHTMLTextAABBBounds: jest.fn()
    };
  });

  test('updateMultilineAABBBounds should pass linesLayout into LayoutBBox for wrapped text', () => {
    const layoutBBox = jest.spyOn(CanvasTextLayout.prototype, 'LayoutBBox');
    const wrapText = createWrapText({
      text: ['back-end engineer 这是什么 what is this abcdefg'],
      fontFamily: 'sans-serif',
      fontSize: 14,
      textAlign: 'left',
      textBaseline: 'top',
      lineHeight: 14,
      ellipsis: '...',
      maxLineWidth: 0,
      heightLimit: 60
    }) as any;

    expect(() => wrapText.updateMultilineAABBBounds(wrapText.attribute.text)).not.toThrow();
    expect(wrapText.cache.layoutData).toBeDefined();
    expect(layoutBBox).toHaveBeenCalledTimes(1);
    expect(layoutBBox.mock.calls[0][3]).toEqual(expect.any(Array));
    expect(application.graphicUtil.getTextMeasureInstance).toHaveBeenCalled();
  });

  test('updateMultilineAABBBounds should keep ascent/descent for alphabetic baseline text', () => {
    const wrapText = createWrapText({
      text: '这是abc',
      x: 200,
      y: 100,
      textAlign: 'left',
      textBaseline: 'alphabetic',
      fill: 'red',
      maxLineWidth: 600
    }) as any;
    jest.spyOn(wrapText, 'getGraphicService').mockReturnValue({
      validCheck: jest.fn(() => true),
      beforeUpdateAABBBounds: jest.fn(),
      afterUpdateAABBBounds: jest.fn()
    });

    expect(() => wrapText.updateSingallineAABBBounds(wrapText.attribute.text)).not.toThrow();
    const bbox = wrapText.AABBBounds;
    expect(Number.isFinite(bbox.y1)).toBe(true);
    expect(Number.isFinite(bbox.y2)).toBe(true);
    expect(bbox.y2).toBeGreaterThan(bbox.y1);
  });
});
