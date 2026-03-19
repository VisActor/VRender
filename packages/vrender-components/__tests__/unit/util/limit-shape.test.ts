import { computeOffsetForlimit, limitShapeInBounds } from '../../../src/util/limit-shape';

describe('util/limit-shape', () => {
  test('computeOffsetForlimit returns zero when inside', () => {
    const shape: any = { AABBBounds: { x1: 10, y1: 10, x2: 20, y2: 20 } };
    expect(computeOffsetForlimit(shape, { x1: 0, y1: 0, x2: 100, y2: 100 } as any)).toEqual({ dx: 0, dy: 0 });
  });

  test('computeOffsetForlimit handles left/right/top/bottom overflow', () => {
    expect(
      computeOffsetForlimit({ AABBBounds: { x1: -10, y1: 0, x2: 10, y2: 10 } } as any, { x1: 0, y1: 0, x2: 100, y2: 100 } as any)
    ).toEqual({ dx: 10, dy: 0 });
    expect(
      computeOffsetForlimit({ AABBBounds: { x1: 0, y1: 0, x2: 130, y2: 10 } } as any, { x1: 0, y1: 0, x2: 100, y2: 100 } as any)
    ).toEqual({ dx: -30, dy: 0 });
    expect(
      computeOffsetForlimit({ AABBBounds: { x1: 0, y1: -5, x2: 10, y2: 10 } } as any, { x1: 0, y1: 0, x2: 100, y2: 100 } as any)
    ).toEqual({ dx: 0, dy: 5 });
    expect(
      computeOffsetForlimit({ AABBBounds: { x1: 0, y1: 0, x2: 10, y2: 120 } } as any, { x1: 0, y1: 0, x2: 100, y2: 100 } as any)
    ).toEqual({ dx: 0, dy: -20 });
  });

  test('computeOffsetForlimit overwrites dx when both sides overflow', () => {
    const res = computeOffsetForlimit(
      { AABBBounds: { x1: -10, y1: 0, x2: 120, y2: 10 } } as any,
      { x1: 0, y1: 0, x2: 100, y2: 100 } as any
    );
    expect(res).toEqual({ dx: -20, dy: 0 });
  });

  test('limitShapeInBounds sets dx/dy with origin offsets', () => {
    const setAttribute = jest.fn();
    const shape: any = {
      AABBBounds: { x1: -10, y1: -5, x2: 10, y2: 10 },
      attribute: { dx: 3, dy: 4 },
      setAttribute
    };

    limitShapeInBounds(shape, { x1: 0, y1: 0, x2: 100, y2: 100 } as any);
    expect(setAttribute).toHaveBeenCalledWith('dx', 13);
    expect(setAttribute).toHaveBeenCalledWith('dy', 9);
  });

  test('limitShapeInBounds does nothing when no offset', () => {
    const setAttribute = jest.fn();
    const shape: any = {
      AABBBounds: { x1: 10, y1: 10, x2: 20, y2: 20 },
      attribute: { dx: 3, dy: 4 },
      setAttribute
    };

    limitShapeInBounds(shape, { x1: 0, y1: 0, x2: 100, y2: 100 } as any);
    expect(setAttribute).not.toHaveBeenCalled();
  });
});
