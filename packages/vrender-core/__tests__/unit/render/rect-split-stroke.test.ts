import {
  DefaultRectRenderContribution,
  SplitRectAfterRenderContribution,
  SplitRectBeforeRenderContribution
} from '../../../src/render/contributions/render/contributions/rect-contribution-render';

describe('rect split stroke contribution', () => {
  test('treats null stroke array entries as disabled rect sides', () => {
    const contribution = new SplitRectBeforeRenderContribution();
    const doFillOrStroke = { doFill: true, doStroke: true };
    const rect = {
      attribute: {
        stroke: [null, null, '#E1E4E8', null]
      }
    };

    contribution.drawShape(
      rect as any,
      {} as any,
      0,
      0,
      true,
      true,
      true,
      true,
      { stroke: false } as any,
      {} as any,
      undefined,
      undefined,
      doFillOrStroke
    );

    expect(doFillOrStroke.doStroke).toBe(false);
  });

  test('draws only truthy rect sides for null split stroke arrays', () => {
    const contribution = new SplitRectAfterRenderContribution();
    const rect = {
      attribute: {
        x: 10,
        y: 20,
        width: 100,
        height: 40,
        stroke: [null, null, '#E1E4E8', null],
        cornerRadius: 0,
        cornerType: 'round'
      }
    };
    const context = {
      lineWidth: 2,
      setStrokeStyle: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn()
    };

    contribution.drawShape(
      rect as any,
      context as any,
      10,
      20,
      true,
      true,
      true,
      true,
      { x: 0, y: 0, stroke: false, cornerRadius: 0, cornerType: 'round' } as any,
      {} as any
    );

    expect(context.lineTo).toHaveBeenCalledTimes(1);
    expect(context.lineTo).toHaveBeenCalledWith(10, 60);
    expect(context.stroke).toHaveBeenCalledTimes(1);
  });

  test('emits the same outer-border path for positive and negative rect widths', () => {
    const contribution = new DefaultRectRenderContribution();
    const positiveContext = { beginPath: jest.fn(), rect: jest.fn() };
    const negativeContext = { beginPath: jest.fn(), rect: jest.fn() };
    const rectAttribute = {
      x: 92,
      y: 20,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      keepStrokeScale: true,
      cornerRadius: 0,
      cornerType: 'round',
      outerBorder: { distance: 6 },
      innerBorder: { distance: 0 }
    };

    contribution.drawShape(
      { attribute: { x: 92, y: 20, width: 8, height: 10, outerBorder: { distance: 6 } } } as any,
      positiveContext as any,
      92,
      20,
      true,
      true,
      true,
      true,
      rectAttribute as any,
      {} as any
    );
    contribution.drawShape(
      { attribute: { x: 100, y: 20, x1: 92, y1: 30, outerBorder: { distance: 6 } } } as any,
      negativeContext as any,
      100,
      20,
      true,
      true,
      true,
      true,
      { ...rectAttribute, x: 100 } as any,
      {} as any
    );

    expect(positiveContext.rect).toHaveBeenCalledWith(86, 14, 20, 22);
    expect(negativeContext.rect).toHaveBeenCalledWith(86, 14, 20, 22);
  });

  test('extends a negative-width outer-border path across the physical bounds', () => {
    const contribution = new DefaultRectRenderContribution();
    const context = { beginPath: jest.fn(), rect: jest.fn() };

    contribution.drawShape(
      { attribute: { x: 100, y: 20, x1: 92, y1: 30, outerBorder: { distance: 6 } } } as any,
      context as any,
      100,
      20,
      true,
      true,
      true,
      true,
      {
        x: 100,
        y: 20,
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        keepStrokeScale: true,
        cornerRadius: 0,
        cornerType: 'round',
        outerBorder: { distance: 6 },
        innerBorder: { distance: 0 }
      } as any,
      {} as any
    );

    const [x, , width] = context.rect.mock.calls[0];
    expect([x, x + width]).toEqual([86, 106]);
  });

  test('preserves the non-degenerate positive inner-border path', () => {
    const contribution = new DefaultRectRenderContribution();
    const context = { beginPath: jest.fn(), rect: jest.fn() };

    contribution.drawShape(
      { attribute: { x: 92, y: 20, width: 8, height: 10, innerBorder: { distance: 2 } } } as any,
      context as any,
      92,
      20,
      true,
      true,
      true,
      true,
      {
        x: 92,
        y: 20,
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        keepStrokeScale: true,
        cornerRadius: 0,
        cornerType: 'round',
        outerBorder: { distance: 0 },
        innerBorder: { distance: 2 }
      } as any,
      {} as any
    );

    expect(context.rect).toHaveBeenCalledWith(94, 22, 4, 6);
  });
});
