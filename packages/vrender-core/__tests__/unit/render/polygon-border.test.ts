import { DefaultPolygonRenderContribution } from '../../../src/render/contributions/render/contributions/polygon-contribution-render';

describe('polygon border contribution', () => {
  test('keeps a rounded open polygon border open', () => {
    const contribution = new DefaultPolygonRenderContribution();
    const nativeContext = {
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arcTo: jest.fn()
    };
    const context: any = {
      camera: null,
      nativeContext,
      beginPath: jest.fn(),
      closePath: jest.fn()
    };
    const polygon = {
      attribute: {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 }
        ],
        cornerRadius: 2,
        closePath: false,
        keepStrokeScale: true,
        outerBorder: { stroke: '#f00', distance: 10 }
      }
    };
    const strokeCb = jest.fn();

    contribution.drawShape(
      polygon as any,
      context as any,
      0,
      0,
      true,
      true,
      true,
      true,
      {
        points: [],
        cornerRadius: 0,
        closePath: true,
        keepStrokeScale: false,
        opacity: 1,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        outerBorder: { distance: 0 },
        innerBorder: { distance: 0 }
      } as any,
      {} as any,
      undefined,
      strokeCb
    );

    expect(context.closePath).not.toHaveBeenCalled();
    expect(nativeContext.lineTo).toHaveBeenLastCalledWith(110, 100);
    expect(strokeCb).toHaveBeenCalledTimes(1);
  });

  test('adjusts rounded convex and concave corners in opposite directions', () => {
    const contribution = new DefaultPolygonRenderContribution();
    const nativeContext = {
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arcTo: jest.fn()
    };
    const context: any = {
      camera: null,
      nativeContext,
      beginPath: jest.fn(),
      closePath: jest.fn()
    };
    const polygon = {
      attribute: {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 40 },
          { x: 40, y: 40 },
          { x: 40, y: 100 },
          { x: 0, y: 100 }
        ],
        cornerRadius: 10,
        closePath: true,
        keepStrokeScale: true,
        outerBorder: { stroke: '#f00', distance: 5 },
        innerBorder: { stroke: '#00f', distance: 5 }
      }
    };

    contribution.drawShape(
      polygon as any,
      context,
      0,
      0,
      true,
      true,
      true,
      true,
      {
        points: [],
        cornerRadius: 0,
        closePath: true,
        keepStrokeScale: false,
        opacity: 1,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        outerBorder: { distance: 0 },
        innerBorder: { distance: 0 }
      } as any,
      {} as any,
      undefined,
      jest.fn()
    );

    const radiusAt = (x: number, y: number) =>
      nativeContext.arcTo.mock.calls.find(args => args[0] === x && args[1] === y)?.[4];
    expect(radiusAt(-5, -5)).toBe(15);
    expect(radiusAt(45, 45)).toBe(5);
    expect(radiusAt(5, 5)).toBe(5);
    expect(radiusAt(35, 35)).toBe(15);
  });

  test('does not emit non-finite coordinates for rounded borders with duplicate points', () => {
    const contribution = new DefaultPolygonRenderContribution();
    const nativeContext = {
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arcTo: jest.fn()
    };
    const context: any = {
      camera: null,
      nativeContext,
      beginPath: jest.fn(),
      closePath: jest.fn()
    };
    const polygon = {
      attribute: {
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
        cornerRadius: 2,
        closePath: true,
        keepStrokeScale: true,
        outerBorder: { stroke: '#f00', distance: 10 }
      }
    };

    contribution.drawShape(
      polygon as any,
      context,
      0,
      0,
      true,
      true,
      true,
      true,
      {
        points: [],
        cornerRadius: 0,
        closePath: true,
        keepStrokeScale: false,
        opacity: 1,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        outerBorder: { distance: 0 },
        innerBorder: { distance: 0 }
      } as any,
      {} as any,
      undefined,
      jest.fn()
    );

    const pathCalls = ([] as number[]).concat(
      ...nativeContext.moveTo.mock.calls,
      ...nativeContext.lineTo.mock.calls,
      ...nativeContext.arcTo.mock.calls
    );
    expect(pathCalls.length).toBeGreaterThan(0);
    expect(pathCalls.every(Number.isFinite)).toBe(true);
  });
});
