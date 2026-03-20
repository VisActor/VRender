declare var require: any;

import { Direction } from '../../../src/common/enums';

describe('common/render-area', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('drawAreaSegments returns when top/bottom curve counts mismatch', () => {
    jest.isolateModules(() => {
      const { drawAreaSegments } = require('../../../src/common/render-area');
      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn()
      };

      drawAreaSegments(
        path as any,
        {
          top: { curves: [{ p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, defined: true }] },
          bottom: {
            curves: [
              { p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, defined: true },
              { p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, defined: true }
            ]
          }
        } as any,
        1
      );

      expect(path.moveTo).not.toHaveBeenCalled();
      expect(path.lineTo).not.toHaveBeenCalled();
      expect(path.closePath).not.toHaveBeenCalled();
    });
  });

  test('drawAreaSegments percent>=1 draws defined blocks and closes per block', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      const { drawAreaSegments } = require('../../../src/common/render-area');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn()
      };

      const top = {
        curves: [
          { p0: { x: 0, y: 0 }, p1: { x: 1, y: 0 }, defined: true },
          { p0: { x: 1, y: 0 }, p1: { x: 2, y: 0 }, defined: false },
          { p0: { x: 2, y: 0 }, p1: { x: 3, y: 0 }, defined: true }
        ]
      };
      const bottom = {
        curves: [
          { p0: { x: 2, y: 1 }, p1: { x: 3, y: 1 }, defined: true },
          { p0: { x: 1, y: 1 }, p1: { x: 2, y: 1 }, defined: true },
          { p0: { x: 0, y: 1 }, p1: { x: 1, y: 1 }, defined: true }
        ]
      };

      drawAreaSegments(path as any, { top, bottom } as any, 1, { offsetX: 10, offsetY: 20, offsetZ: 7 });

      expect(path.closePath).toHaveBeenCalledTimes(2);
      expect(drawSegItem).toHaveBeenCalledTimes(4);
    });
  });

  test('drawAreaSegments percent<1 divides curves and draws partial area', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      const divideCubic = jest.fn(() => [
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 1 },
          p2: { x: 2, y: 2 },
          p3: { x: 3, y: 3 }
        },
        {
          p0: { x: 3, y: 3 },
          p1: { x: 4, y: 4 },
          p2: { x: 5, y: 5 },
          p3: { x: 6, y: 6 }
        }
      ]);
      const divideLinear = jest.fn(() => [
        { p0: { x: 0, y: 10 }, p1: { x: 50, y: 10 } },
        { p0: { x: 50, y: 10 }, p1: { x: 100, y: 10 } }
      ]);

      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      jest.doMock('../../../src/common/segment/curve/cubic-bezier', () => ({ divideCubic }));
      jest.doMock('../../../src/common/segment/curve/line', () => ({ divideLinear }));

      const { drawAreaSegments } = require('../../../src/common/render-area');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      const topCurve = {
        p0: { x: 0, y: 0 },
        p1: { x: 10, y: 0 },
        p2: { x: 20, y: 0 },
        p3: { x: 100, y: 0 },
        defined: true,
        getLength: jest.fn(() => 100)
      };
      const bottomCurve = {
        p0: { x: 0, y: 10 },
        p1: { x: 100, y: 10 },
        defined: true
      };

      drawAreaSegments(path as any, { top: { curves: [topCurve] }, bottom: { curves: [bottomCurve] } } as any, 0.5);

      expect(topCurve.getLength).toHaveBeenCalledWith(Direction.ROW);
      expect(divideCubic).toHaveBeenCalledWith(topCurve, 0.5);
      expect(divideLinear).toHaveBeenCalledWith(bottomCurve, 0.5);

      expect(drawSegItem).toHaveBeenCalledTimes(2);
      // top uses first part, bottom uses second part
      expect(drawSegItem.mock.calls[0][1]).toEqual(expect.objectContaining({ p0: { x: 0, y: 0 } }));
      expect(drawSegItem.mock.calls[1][1]).toEqual(expect.objectContaining({ p0: { x: 50, y: 10 } }));
      expect(path.closePath).toHaveBeenCalledTimes(1);
    });
  });

  test('drawAreaSegments percent<1 divides linear top & cubic bottom and breaks on negative percent', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      const divideCubic = jest.fn(() => [
        {
          p0: { x: 0, y: 10 },
          p1: { x: 0, y: 11 },
          p2: { x: 0, y: 12 },
          p3: { x: 0, y: 13 }
        },
        {
          p0: { x: 0, y: 13 },
          p1: { x: 0, y: 14 },
          p2: { x: 0, y: 15 },
          p3: { x: 0, y: 16 }
        }
      ]);
      const divideLinear = jest.fn(() => [
        { p0: { x: 0, y: 0 }, p1: { x: 0, y: 5 } },
        { p0: { x: 0, y: 5 }, p1: { x: 0, y: 10 } }
      ]);

      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      jest.doMock('../../../src/common/segment/curve/cubic-bezier', () => ({ divideCubic }));
      jest.doMock('../../../src/common/segment/curve/line', () => ({ divideLinear }));

      const { drawAreaSegments } = require('../../../src/common/render-area');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn()
      };

      const topCurve1 = {
        p0: { x: 0, y: 0 },
        p1: { x: 0, y: 10 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const topCurve2 = {
        p0: { x: 0, y: 10 },
        p1: { x: 0, y: 20 },
        defined: true,
        getLength: jest.fn(() => 10)
      };

      const bottomCurve1 = {
        p0: { x: 1, y: 0 },
        p1: { x: 1, y: 10 },
        defined: true
      };
      const bottomCurve2 = {
        p0: { x: 1, y: 10 },
        p1: { x: 1, y: 11 },
        p2: { x: 1, y: 12 },
        p3: { x: 1, y: 20 },
        defined: true
      };

      drawAreaSegments(
        path as any,
        {
          top: { curves: [topCurve1, topCurve2] },
          bottom: { curves: [bottomCurve1, bottomCurve2] }
        } as any,
        0.25
      );

      expect(topCurve1.getLength).toHaveBeenCalledWith(Direction.COLUMN);
      expect(divideLinear).toHaveBeenCalledWith(topCurve1, 0.5);
      expect(divideCubic).toHaveBeenCalledWith(bottomCurve2, 0.5);
      // second segment should break before dividing
      expect(divideCubic).toHaveBeenCalledTimes(1);
    });
  });

  test('drawAreaSegments forces direction ROW when yTotalLength is not finite', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      const divideLinear = jest.fn(() => [
        { p0: { x: 0, y: 0 }, p1: { x: 50, y: 0 } },
        { p0: { x: 50, y: 0 }, p1: { x: 100, y: 0 } }
      ]);

      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      jest.doMock('../../../src/common/segment/curve/line', () => ({ divideLinear }));

      const { drawAreaSegments } = require('../../../src/common/render-area');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn()
      };

      const topCurve = {
        p0: { x: 0, y: 0 },
        p1: { x: 100, y: Number.NaN },
        defined: true,
        getLength: jest.fn(() => 100)
      };
      const bottomCurve = {
        p0: { x: 0, y: 10 },
        p1: { x: 100, y: 10 },
        defined: true
      };

      drawAreaSegments(path as any, { top: { curves: [topCurve] }, bottom: { curves: [bottomCurve] } } as any, 0.5);

      expect(topCurve.getLength).toHaveBeenCalledWith(Direction.ROW);
      expect(divideLinear).toHaveBeenCalled();
    });
  });

  test('drawAreaSegments returns early when percent<=0', () => {
    jest.isolateModules(() => {
      const { drawAreaSegments } = require('../../../src/common/render-area');
      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn()
      };

      drawAreaSegments(path as any, { top: { curves: [] }, bottom: { curves: [] } } as any, 0);

      expect(path.closePath).not.toHaveBeenCalled();
    });
  });
});
