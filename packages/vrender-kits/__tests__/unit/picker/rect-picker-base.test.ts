import { AABBBounds } from '@visactor/vutils';
import { RectPickerBase } from '../../../src/picker/contributions/common/rect-picker-base';

describe('picker/contributions/common/rect-picker-base', () => {
  test('returns false when pickContext missing', () => {
    const picker = new RectPickerBase() as any;
    const rect: any = {
      AABBBounds: {
        containsPoint: () => true
      },
      attribute: { pickMode: 'precise' },
      getGraphicTheme: () => ({ x: 0, y: 0, cornerRadius: 0 }),
      transMatrix: { onlyTranslate: () => true },
      getOffsetXY: () => ({ x: 0, y: 0 })
    };

    expect(picker.contains(rect, { x: 0, y: 0 } as any, undefined)).toBe(false);
  });

  test('fast path: fill=true returns true (no drawShape)', () => {
    const picker = new RectPickerBase() as any;

    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 100, 100);

    const rect: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'precise', fill: true, stroke: false, cornerRadius: 0 },
      shadowRoot: null,
      getGraphicTheme: () => ({ x: 0, y: 0, cornerRadius: 0, fill: true, stroke: false, lineWidth: 0 }),
      transMatrix: { onlyTranslate: () => true },
      getOffsetXY: () => ({ x: 0, y: 0 })
    };

    const pickContext: any = {
      highPerformanceSave: (): void => undefined,
      highPerformanceRestore: (): void => undefined,
      setTransformForCurrent: (): void => undefined,
      dpr: 1
    };

    expect(picker.contains(rect, { x: 50, y: 50 } as any, { pickContext } as any)).toBe(true);
  });

  test('fast path: stroke-only uses inner bounds exclusion', () => {
    const picker = new RectPickerBase() as any;

    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 100, 100);

    const rect: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'precise', fill: false, stroke: true, lineWidth: 10, cornerRadius: 0 },
      shadowRoot: null,
      getGraphicTheme: () => ({ x: 0, y: 0, cornerRadius: 0, fill: false, stroke: true, lineWidth: 10 }),
      transMatrix: { onlyTranslate: () => true },
      getOffsetXY: () => ({ x: 0, y: 0 })
    };

    const pickContext: any = {
      highPerformanceSave: (): void => undefined,
      highPerformanceRestore: (): void => undefined,
      setTransformForCurrent: (): void => undefined,
      dpr: 1
    };

    // inside inner bounds -> not picked
    expect(picker.contains(rect, { x: 50, y: 50 } as any, { pickContext } as any)).toBe(false);
    // near edge but still in outer bounds -> picked
    expect(picker.contains(rect, { x: 2, y: 50 } as any, { pickContext } as any)).toBe(true);
  });

  test('detailed path: cornerRadius triggers drawShape and path hit', () => {
    const picker = new RectPickerBase() as any;
    const drawShape = jest.fn((_rect: any, _pickContext: any, _x: any, _y: any, _a: any, _b: any, fillCb: any) => {
      const ctx = {
        isPointInPath: jest.fn(() => true),
        isPointInStroke: jest.fn(() => false)
      };
      fillCb(ctx as any, {} as any, {} as any);
    });
    picker.canvasRenderer = { drawShape };

    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 100, 100);

    const rect: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'precise', fill: true, stroke: false, cornerRadius: 4 },
      shadowRoot: null,
      getGraphicTheme: () => ({ x: 0, y: 0, cornerRadius: 0, fill: true, stroke: false, lineWidth: 0 }),
      transMatrix: { onlyTranslate: () => true },
      getOffsetXY: () => ({ x: 0, y: 0 })
    };

    const pickContext: any = {
      highPerformanceSave: jest.fn(),
      highPerformanceRestore: jest.fn(),
      setTransformForCurrent: jest.fn(),
      dpr: 1
    };

    expect(picker.contains(rect, { x: 50, y: 50 } as any, { pickContext } as any)).toBe(true);
    expect(drawShape).toHaveBeenCalled();
  });

  test('detailed path: non-translate uses transformFromMatrix and x/y reset', () => {
    const picker = new RectPickerBase() as any;
    const drawShape = jest.fn((_rect: any, _pickContext: any, x: any, y: any, _a: any, _b: any, fillCb: any) => {
      const ctx = {
        isPointInPath: jest.fn(() => true),
        isPointInStroke: jest.fn(() => false)
      };
      fillCb(ctx as any, {} as any, {} as any);
      return { x, y };
    });
    picker.canvasRenderer = { drawShape };

    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 100, 100);

    const rect: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'precise', fill: true, stroke: false, cornerRadius: 0 },
      shadowRoot: null,
      getGraphicTheme: () => ({ x: 10, y: 20, cornerRadius: 0, fill: true, stroke: false, lineWidth: 0 }),
      transMatrix: { onlyTranslate: () => false },
      getOffsetXY: () => ({ x: 0, y: 0 })
    };

    const pickContext: any = {
      highPerformanceSave: jest.fn(),
      highPerformanceRestore: jest.fn(),
      transformFromMatrix: jest.fn(),
      setTransformForCurrent: jest.fn(),
      dpr: 1
    };

    expect(picker.contains(rect, { x: 50, y: 50 } as any, { pickContext } as any)).toBe(true);
    expect(pickContext.transformFromMatrix).toHaveBeenCalled();
    expect(drawShape.mock.calls[0][2]).toBe(0);
    expect(drawShape.mock.calls[0][3]).toBe(0);
  });
});
