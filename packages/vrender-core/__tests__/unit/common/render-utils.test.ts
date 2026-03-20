declare var require: any;

describe('common/render-utils', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('drawSegItem returns early when curve has no p1', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(ctx as any, { p0: { x: 0, y: 0 } } as any, 1);

      expect(ctx.lineTo).not.toHaveBeenCalled();
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem draws full cubic when endPercent=1', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 },
          p2: { x: 3, y: 4 },
          p3: { x: 5, y: 6 }
        } as any,
        1,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(ctx.bezierCurveTo).toHaveBeenCalledWith(11, 22, 13, 24, 15, 26, 7);
      expect(ctx.lineTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem draws full line when endPercent=1', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 }
        } as any,
        1,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(ctx.lineTo).toHaveBeenCalledWith(11, 22, 7);
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem uses default offsets when params omitted', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 }
        } as any,
        1
      );

      expect(ctx.lineTo).toHaveBeenCalledWith(1, 2, 0);
    });
  });

  test('drawSegItem applies partial default offsets', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 }
        } as any,
        1,
        { offsetX: 10 }
      );

      expect(ctx.lineTo).toHaveBeenCalledWith(11, 2, 0);
    });
  });

  test('drawSegItem treats missing p3 as linear', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 },
          p2: { x: 3, y: 4 }
        } as any,
        1,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(ctx.lineTo).toHaveBeenCalledWith(11, 22, 7);
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem treats missing p2 as linear', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 },
          p3: { x: 5, y: 6 }
        } as any,
        1,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(ctx.lineTo).toHaveBeenCalledWith(11, 22, 7);
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem draws partial cubic via divideCubic', () => {
    jest.isolateModules(() => {
      const divideCubic = jest.fn(() => [
        {
          p1: { x: 10, y: 20 },
          p2: { x: 30, y: 40 },
          p3: { x: 50, y: 60 }
        }
      ]);
      jest.doMock('../../../src/common/segment/curve/cubic-bezier', () => ({ divideCubic }));

      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };
      const curve = {
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 2 },
        p2: { x: 3, y: 4 },
        p3: { x: 5, y: 6 }
      };

      drawSegItem(ctx as any, curve as any, 0.5, { offsetX: 1, offsetY: 2, offsetZ: 3 });

      expect(divideCubic).toHaveBeenCalledWith(curve, 0.5);
      expect(ctx.bezierCurveTo).toHaveBeenCalledWith(11, 22, 31, 42, 51, 62, 3);
      expect(ctx.lineTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem draws partial line via getPointAt', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      const getPointAt = jest.fn(() => ({ x: 9, y: 8 }));

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 1, y: 2 },
          getPointAt
        } as any,
        0.25,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(getPointAt).toHaveBeenCalledWith(0.25);
      expect(ctx.lineTo).toHaveBeenCalledWith(19, 28, 7);
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegItem partial treats missing p3 as linear', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      const getPointAt = jest.fn(() => ({ x: 1, y: 2 }));

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 10, y: 20 },
          p2: { x: 30, y: 40 },
          getPointAt
        } as any,
        0.5,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(getPointAt).toHaveBeenCalledWith(0.5);
      expect(ctx.lineTo).toHaveBeenCalledWith(11, 22, 7);
    });
  });

  test('drawSegItem partial treats missing p2 as linear', () => {
    jest.isolateModules(() => {
      const { drawSegItem } = require('../../../src/common/render-utils');
      const ctx = {
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn()
      };

      const getPointAt = jest.fn(() => ({ x: 3, y: 4 }));

      drawSegItem(
        ctx as any,
        {
          p0: { x: 0, y: 0 },
          p1: { x: 10, y: 20 },
          p3: { x: 30, y: 40 },
          getPointAt
        } as any,
        0.5,
        { offsetX: 10, offsetY: 20, offsetZ: 7 }
      );

      expect(getPointAt).toHaveBeenCalledWith(0.5);
      expect(ctx.lineTo).toHaveBeenCalledWith(13, 24, 7);
    });
  });
});
