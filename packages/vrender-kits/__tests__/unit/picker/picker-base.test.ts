import { PickerBase } from '../../../src/picker/contributions/common/base';

describe('picker/contributions/common/base', () => {
  class TestPicker extends PickerBase {}

  test('returns false when AABB does not contain point', () => {
    const picker = new TestPicker();
    const graphic: any = {
      AABBBounds: { containsPoint: () => false },
      attribute: {}
    };
    expect(picker.contains(graphic, { x: 0, y: 0 } as any, {} as any)).toBe(false);
  });

  test('returns true when pickMode=imprecise', () => {
    const picker = new TestPicker();
    const graphic: any = {
      AABBBounds: { containsPoint: () => true },
      attribute: { pickMode: 'imprecise' }
    };
    expect(picker.contains(graphic, { x: 0, y: 0 } as any, undefined)).toBe(true);
  });

  test('returns true when canvasRenderer is missing', () => {
    const picker = new TestPicker();
    const graphic: any = {
      AABBBounds: { containsPoint: () => true },
      attribute: { pickMode: 'precise' }
    };
    expect(picker.contains(graphic, { x: 0, y: 0 } as any, undefined)).toBe(true);
  });

  test('returns false when pickContext missing but renderer exists', () => {
    const picker = new TestPicker();
    (picker as any).canvasRenderer = { drawShape: jest.fn() };

    const graphic: any = {
      AABBBounds: { containsPoint: () => true },
      attribute: { pickMode: 'precise' }
    };

    expect(picker.contains(graphic, { x: 0, y: 0 } as any, {} as any)).toBe(false);
    expect((picker as any).canvasRenderer.drawShape).not.toHaveBeenCalled();
  });

  test('uses canvasRenderer.drawShape and fill callback', () => {
    const picker = new TestPicker();
    const drawShape = jest.fn((_g: any, _pickContext: any, _x: any, _y: any, _a: any, _b: any, fillCb: any) => {
      const ctx = {
        isPointInPath: jest.fn(() => true),
        isPointInStroke: jest.fn(() => false)
      };
      fillCb(ctx as any, {} as any, {} as any, true);
    });
    (picker as any).canvasRenderer = { drawShape };

    const pickContext: any = {
      highPerformanceSave: jest.fn(),
      highPerformanceRestore: jest.fn(),
      transformFromMatrix: jest.fn(),
      setTransformForCurrent: jest.fn(),
      dpr: 1,
      currentMatrix: { a: 1, b: 0, c: 0, d: 1 }
    };

    const graphic: any = {
      AABBBounds: { containsPoint: () => true },
      attribute: { pickMode: 'precise', x: 10, y: 20 },
      getGraphicTheme: () => ({ x: 0, y: 0, lineWidth: 1, pickStrokeBuffer: 0, keepStrokeScale: true }),
      transMatrix: { onlyTranslate: () => true },
      getOffsetXY: () => ({ x: 1, y: 2 })
    };

    expect(picker.contains(graphic, { x: 5, y: 6 } as any, { pickContext } as any)).toBe(true);
    expect(pickContext.setTransformForCurrent).toHaveBeenCalled();
    expect(drawShape).toHaveBeenCalled();
  });

  test('stroke callback sets pickContext.lineWidth (keepStrokeScale=true)', () => {
    const picker = new TestPicker();
    const drawShape = jest.fn(
      (_g: any, _pickContext: any, _x: any, _y: any, _a: any, _b: any, _fillCb: any, strokeCb: any) => {
        const ctx = {
          isPointInPath: jest.fn(() => false),
          isPointInStroke: jest.fn(() => true)
        };
        strokeCb(
          ctx as any,
          { lineWidth: 3, pickStrokeBuffer: 2, keepStrokeScale: true } as any,
          { lineWidth: 1, pickStrokeBuffer: 0, keepStrokeScale: true } as any,
          true
        );
      }
    );
    (picker as any).canvasRenderer = { drawShape };

    const pickContext: any = {
      highPerformanceSave: jest.fn(),
      highPerformanceRestore: jest.fn(),
      transformFromMatrix: jest.fn(),
      setTransformForCurrent: jest.fn(),
      dpr: 1,
      currentMatrix: { a: 1, b: 0, c: 0, d: 1 },
      lineWidth: 0
    };

    const graphic: any = {
      AABBBounds: { containsPoint: () => true },
      attribute: { pickMode: 'precise' },
      getGraphicTheme: () => ({ x: 0, y: 0, lineWidth: 1, pickStrokeBuffer: 0, keepStrokeScale: true }),
      transMatrix: { onlyTranslate: () => true },
      getOffsetXY: () => ({ x: 0, y: 0 })
    };

    expect(picker.contains(graphic, { x: 0, y: 0 } as any, { pickContext } as any)).toBe(true);
    expect(pickContext.lineWidth).toBe(5);
  });
});
