declare var require: any;

describe('common/canvas-utils', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('getScaledStroke handles scale sum zero', () => {
    const { getScaledStroke } = require('../../../src/common/canvas-utils');
    const ctx = { currentMatrix: { a: 0, b: 0, c: 0, d: 0 } };
    expect(getScaledStroke(ctx as any, 10, 2)).toBe(0);
  });

  test('getScaledStroke handles identity and scaling', () => {
    const { getScaledStroke } = require('../../../src/common/canvas-utils');

    expect(getScaledStroke({ currentMatrix: { a: 1, b: 0, c: 0, d: 1 } } as any, 10, 1)).toBeCloseTo(10);
    expect(getScaledStroke({ currentMatrix: { a: 2, b: 0, c: 0, d: 3 } } as any, 10, 2)).toBeCloseTo(8);
    expect(getScaledStroke({ currentMatrix: { a: -2, b: 0, c: 0, d: -2 } } as any, 4, 1)).toBeCloseTo(2);
  });

  test('createColor returns black for falsy/true', () => {
    jest.isolateModules(() => {
      const { createColor } = require('../../../src/common/canvas-utils');
      expect(createColor({} as any, null, {} as any)).toBe('black');
      expect(createColor({} as any, true, {} as any)).toBe('black');
    });
  });

  test('createColor returns first truthy array color', () => {
    jest.isolateModules(() => {
      const { createColor } = require('../../../src/common/canvas-utils');
      expect(createColor({} as any, [undefined, '', '#ff0'], {} as any)).toBe('#ff0');
    });
  });

  test('createColor returns parsed string directly', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => 'pink');
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const { createColor } = require('../../../src/common/canvas-utils');
      const ctx = {
        createLinearGradient: jest.fn(),
        createRadialGradient: jest.fn(),
        createConicGradient: jest.fn()
      };
      expect(createColor(ctx as any, 'linear-gradient(0deg, red, blue)', {} as any)).toBe('pink');
      expect(ctx.createLinearGradient).not.toHaveBeenCalled();
      expect(parseMock).toHaveBeenCalled();
    });
  });

  test('createColor returns orange when no bounds or scale is zero', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => ({
        gradient: 'linear',
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 1,
        stops: [{ offset: 0, color: 'red' }]
      }));
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const { createColor } = require('../../../src/common/canvas-utils');
      const ctx = {
        createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() }))
      };

      expect(createColor(ctx as any, 'g', {} as any)).toBe('orange');

      const bounds = { x1: 0, y1: 0, x2: 10, y2: 10 };
      expect(createColor(ctx as any, 'g', { AABBBounds: bounds, attribute: { scaleX: 0, scaleY: 0 } } as any)).toBe('orange');
    });
  });

  test('createColor creates linear gradient with bounds', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => ({
        gradient: 'linear',
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 1,
        stops: [
          { offset: 0, color: 'red' },
          { offset: 1, color: 'blue' }
        ]
      }));
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const gradient = { addColorStop: jest.fn() };
      const ctx = {
        createLinearGradient: jest.fn(() => gradient)
      };
      const { createColor } = require('../../../src/common/canvas-utils');
      const bounds = { x1: 10, y1: 20, x2: 110, y2: 220 };

      const res = createColor(ctx as any, 'g', { AABBBounds: bounds } as any);
      expect(ctx.createLinearGradient).toHaveBeenCalledWith(10, 20, 110, 220);
      expect(gradient.addColorStop).toHaveBeenCalledWith(0, 'red');
      expect(gradient.addColorStop).toHaveBeenCalledWith(1, 'blue');
      expect(res).toBe(gradient);
    });
  });

  test('createColor uses untransformed bounds when angle/scale provided', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => ({
        gradient: 'linear',
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 1,
        stops: [{ offset: 0, color: 'red' }]
      }));
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const gradient = { addColorStop: jest.fn() };
      const ctx = {
        createLinearGradient: jest.fn(() => gradient)
      };
      const { createColor } = require('../../../src/common/canvas-utils');
      const bounds = { x1: 0, y1: 0, x2: 100, y2: 100 };

      createColor(ctx as any, 'g', {
        AABBBounds: bounds,
        attribute: { scaleX: 2, scaleY: 2, angle: 1 },
        x1WithoutTransform: 10,
        y1WithoutTransform: 20,
        widthWithoutTransform: 30,
        heightWithoutTransform: 40
      } as any);

      expect(ctx.createLinearGradient).toHaveBeenCalledWith(10, 20, 40, 60);
    });
  });

  test('createColor creates radial gradient with bounds', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => ({
        gradient: 'radial',
        x0: 0.5,
        y0: 0.5,
        r0: 0,
        x1: 0.5,
        y1: 0.5,
        r1: 0.5,
        stops: [{ offset: 0, color: 'red' }]
      }));
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const gradient = { addColorStop: jest.fn() };
      const ctx = {
        createRadialGradient: jest.fn(() => gradient)
      };
      const { createColor } = require('../../../src/common/canvas-utils');
      const bounds = { x1: 0, y1: 0, x2: 100, y2: 50 };

      const res = createColor(ctx as any, 'g', { AABBBounds: bounds } as any);
      expect(ctx.createRadialGradient).toHaveBeenCalledWith(50, 25, 0, 50, 25, 50);
      expect(gradient.addColorStop).toHaveBeenCalledWith(0, 'red');
      expect(res).toBe(gradient);
    });
  });

  test('createColor conic gradient returns CanvasGradient when GetPattern missing', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => ({
        gradient: 'conical',
        x: 0.5,
        y: 0.5,
        startAngle: 1,
        endAngle: 2,
        stops: [{ offset: 0, color: 'red' }]
      }));
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const conic = {
        addColorStop: jest.fn()
      };
      const ctx = {
        createConicGradient: jest.fn(() => conic)
      };
      const { createColor } = require('../../../src/common/canvas-utils');
      const bounds = { x1: 0, y1: 0, x2: 10, y2: 10 };

      expect(createColor(ctx as any, 'g', { AABBBounds: bounds } as any)).toBe(conic);
    });
  });

  test('createColor conic gradient supports GetPattern branch', () => {
    jest.isolateModules(() => {
      const parseMock = jest.fn(() => ({
        gradient: 'conical',
        x: 0.5,
        y: 0.5,
        startAngle: 1,
        endAngle: 2,
        stops: [{ offset: 0, color: 'red' }]
      }));
      class GradientParser {
        static Parse = parseMock;
      }
      jest.doMock('../../../src/common/color-utils', () => ({ GradientParser }));

      const conic = {
        addColorStop: jest.fn(),
        GetPattern: jest.fn(() => 'PATTERN')
      };
      const ctx = {
        createConicGradient: jest.fn(() => conic)
      };
      const { createColor } = require('../../../src/common/canvas-utils');
      const bounds = { x1: 0, y1: 0, x2: 10, y2: 10 };

      expect(createColor(ctx as any, 'g', { AABBBounds: bounds } as any)).toBe('PATTERN');
      expect(conic.GetPattern).toHaveBeenCalledWith(10, 10, undefined);
    });
  });
});
