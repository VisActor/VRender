import {
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
});
