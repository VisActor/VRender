declare var require: any;

import { Direction } from '../../../src/common/enums';

describe('common/render-curve', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('drawSegments returns early when drawConnect=true & mode=none', () => {
    jest.isolateModules(() => {
      const { drawSegments } = require('../../../src/common/render-curve');
      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      drawSegments(path as any, null as any, 1, 'x' as any, { drawConnect: true, mode: 'none' });

      expect(path.moveTo).not.toHaveBeenCalled();
      expect(path.lineTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegments returns early when segPath missing or percent<=0', () => {
    jest.isolateModules(() => {
      const { drawSegments } = require('../../../src/common/render-curve');
      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      drawSegments(path as any, null as any, 1, 'x' as any);
      drawSegments(path as any, { curves: [] } as any, 0, 'x' as any);

      expect(path.moveTo).not.toHaveBeenCalled();
      expect(path.lineTo).not.toHaveBeenCalled();
    });
  });

  test('drawSegments percent>=1 draws curves and uses moveTo once per defined block', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const curve1 = { p0: { x: 0, y: 0 }, defined: false };
      const curve2 = { p0: { x: 1, y: 2 }, p1: { x: 3, y: 4 }, defined: true };
      const curve3 = { p0: { x: 5, y: 6 }, p1: { x: 7, y: 8 }, defined: true };
      const segPath = { curves: [curve1, curve2, curve3] };
      const params = { offsetX: 10, offsetY: 20, offsetZ: 7 };

      drawSegments(path as any, segPath as any, 1, 'auto' as any, params as any);

      expect(path.moveTo).toHaveBeenCalledTimes(1);
      expect(path.moveTo).toHaveBeenCalledWith(11, 22, 7);

      expect(drawSegItem).toHaveBeenCalledTimes(2);
      expect(drawSegItem).toHaveBeenNthCalledWith(1, path, curve2, 1, params);
      expect(drawSegItem).toHaveBeenNthCalledWith(2, path, curve3, 1, params);
    });
  });

  test('drawSegments percent<1 uses clipRangeByDimension=auto and min(_p,1)', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const curveA = {
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const curveB = {
        p0: { x: 10, y: 0 },
        p1: { x: 11, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const segPath = {
        direction: 'dir' as any,
        curves: [curveA, curveB],
        tryUpdateLength: jest.fn(() => 20)
      };

      drawSegments(path as any, segPath as any, 0.75, 'auto' as any);

      expect(segPath.tryUpdateLength).toHaveBeenCalledWith('dir');
      expect(curveA.getLength).toHaveBeenCalledWith('dir');
      expect(curveB.getLength).toHaveBeenCalledWith('dir');

      expect(drawSegItem).toHaveBeenCalledTimes(2);
      expect(drawSegItem).toHaveBeenNthCalledWith(1, path, curveA, 1, undefined);
      expect(drawSegItem).toHaveBeenNthCalledWith(2, path, curveB, 0.5, undefined);
    });
  });

  test('drawSegments percent<1 sets direction for clipRangeByDimension x/y', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const curve = {
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const segPath = {
        curves: [curve],
        tryUpdateLength: jest.fn(() => 10)
      };

      drawSegments(path as any, segPath as any, 0.5, 'x' as any);
      expect(segPath.tryUpdateLength).toHaveBeenLastCalledWith(Direction.ROW);

      drawSegments(path as any, segPath as any, 0.5, 'y' as any);
      expect(segPath.tryUpdateLength).toHaveBeenLastCalledWith(Direction.COLUMN);
    });
  });

  test('drawSegments percent<1 drawConnect runs drawEachCurve branch', () => {
    jest.isolateModules(() => {
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const shared = {};
      const stepCurve = {
        originP1: shared,
        originP2: shared,
        p0: { x: 1, y: 1 },
        getLength: jest.fn(() => 10)
      };
      const curve2 = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 0, y: 0 },
        p1: { x: 2, y: 2 },
        defined: false,
        getLength: jest.fn(() => 10)
      };

      drawSegments(
        path as any,
        {
          curves: [stepCurve, curve2],
          tryUpdateLength: jest.fn(() => 20)
        } as any,
        0.75,
        'x' as any,
        {
          drawConnect: true,
          mode: 'connect',
          offsetX: 10,
          offsetY: 20,
          offsetZ: 7
        }
      );

      expect(path.moveTo).toHaveBeenCalledWith(12, 22, 7);
    });
  });

  test('drawSegments percent<1 continues on undefined curve and moves again', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const curveA = {
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const curveB = {
        p0: { x: 10, y: 0 },
        p1: { x: 11, y: 1 },
        defined: false,
        getLength: jest.fn(() => 10)
      };
      const curveC = {
        p0: { x: 20, y: 0 },
        p1: { x: 21, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const segPath = {
        direction: 'dir' as any,
        curves: [curveA, curveB, curveC],
        tryUpdateLength: jest.fn(() => 30)
      };

      drawSegments(path as any, segPath as any, 0.9, 'auto' as any);

      expect(path.moveTo).toHaveBeenCalledTimes(2);
      expect(drawSegItem).toHaveBeenCalledTimes(2);
      expect(drawSegItem).toHaveBeenNthCalledWith(2, path, curveC, 0.7, undefined);
    });
  });

  test('drawSegments percent<1 breaks when _p < 0', () => {
    jest.isolateModules(() => {
      const drawSegItem = jest.fn();
      jest.doMock('../../../src/common/render-utils', () => ({ drawSegItem }));
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const curveA = {
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const curveB = {
        p0: { x: 10, y: 0 },
        p1: { x: 11, y: 1 },
        defined: true,
        getLength: jest.fn(() => 10)
      };
      const segPath = {
        direction: 'dir' as any,
        curves: [curveA, curveB],
        tryUpdateLength: jest.fn(() => 20)
      };

      drawSegments(path as any, segPath as any, 0.25, 'auto' as any);

      expect(drawSegItem).toHaveBeenCalledTimes(1);
      expect(drawSegItem).toHaveBeenCalledWith(path, curveA, 0.5, undefined);
    });
  });

  test('drawSegments percent>=1 drawConnect path toggles moveTo/lineTo', () => {
    jest.isolateModules(() => {
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const shared = {};
      const stepCurve = { originP1: shared, originP2: shared, p0: { x: 1, y: 1 } };
      const curve2 = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 0, y: 0 },
        p1: { x: 2, y: 2 },
        defined: false
      };
      const curve3 = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 3, y: 4 },
        p1: { x: 5, y: 6 },
        defined: true
      };

      drawSegments(
        path as any,
        { curves: [stepCurve, curve2, curve3] } as any,
        1,
        'auto' as any,
        {
          drawConnect: true,
          mode: 'connect',
          offsetX: 10,
          offsetY: 20,
          offsetZ: 7
        }
      );

      expect(path.moveTo).toHaveBeenCalledWith(12, 22, 7);
      expect(path.lineTo).toHaveBeenCalledWith(13, 24, 7);
    });
  });

  test('drawSegments drawConnect handles invalid->invalid with validP lineTo', () => {
    jest.isolateModules(() => {
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const shared = {};
      const stepCurve = { originP1: shared, originP2: shared, p0: { x: 1, y: 1 } };
      const curve2 = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 0, y: 0 },
        p1: { x: 2, y: 2 },
        defined: false
      };
      const curve3 = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 0, y: 0 },
        p1: { x: 4, y: 4 },
        defined: false
      };

      drawSegments(
        path as any,
        { curves: [stepCurve, curve2, curve3] } as any,
        1,
        'auto' as any,
        {
          drawConnect: true,
          mode: 'connect',
          offsetX: 10,
          offsetY: 20,
          offsetZ: 7
        }
      );

      expect(path.lineTo).toHaveBeenCalledWith(14, 24, 7);
    });
  });

  test('drawSegments drawConnect uses step p0 when lastCurve is a step', () => {
    jest.isolateModules(() => {
      const { drawSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      const curveA = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 1 },
        defined: false
      };
      const shared = {};
      const stepCurve = { originP1: shared, originP2: shared, p0: { x: 9, y: 9 } };
      const curveC = {
        originP1: { defined: true },
        originP2: { defined: true },
        p0: { x: 2, y: 2 },
        p1: { x: 3, y: 3 },
        defined: true
      };

      drawSegments(
        path as any,
        { curves: [curveA, stepCurve, curveC] } as any,
        1,
        'auto' as any,
        {
          drawConnect: true,
          mode: 'connect',
          offsetX: 10,
          offsetY: 20,
          offsetZ: 7
        }
      );

      expect(path.lineTo).toHaveBeenCalledWith(19, 29, 7);
    });
  });

  test('drawIncrementalSegments draws continuous points and restarts at undefined', () => {
    jest.isolateModules(() => {
      const { drawIncrementalSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      drawIncrementalSegments(
        path as any,
        null as any,
        {
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 1, defined: false },
            { x: 2, y: 2 }
          ]
        } as any,
        { offsetX: 10, offsetY: 20 }
      );

      expect(path.moveTo).toHaveBeenCalledWith(10, 20);
      expect(path.lineTo).toHaveBeenCalledWith(10, 20);
      expect(path.moveTo).toHaveBeenCalledWith(11, 21);
      expect(path.lineTo).toHaveBeenCalledWith(12, 22);
    });
  });

  test('drawIncrementalSegments uses default offsets when params missing', () => {
    jest.isolateModules(() => {
      const { drawIncrementalSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn()
      };

      drawIncrementalSegments(
        path as any,
        { points: [{ x: 5, y: 6 }] } as any,
        { points: [{ x: 1, y: 2 }] } as any
      );

      expect(path.moveTo).toHaveBeenCalledWith(5, 6);
    });
  });

  test('drawIncrementalAreaSegments draws one area and closes', () => {
    jest.isolateModules(() => {
      const { drawIncrementalAreaSegments } = require('../../../src/common/render-curve');

      const path = {
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn()
      };

      const points = [
        { x: 0, y: 0, x1: 0, y1: 10 },
        { x: 10, y: 0, x1: 10, y1: 10 }
      ];

      drawIncrementalAreaSegments(path as any, null as any, { points } as any, { offsetX: 1, offsetY: 2 });

      expect(path.moveTo).toHaveBeenCalledWith(1, 2);
      expect(path.closePath).toHaveBeenCalledTimes(1);
      // bottom layer closes back to start
      expect(path.lineTo).toHaveBeenCalledWith(0, 10);
    });
  });
});
