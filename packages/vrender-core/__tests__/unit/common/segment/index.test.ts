declare var require: any;

describe('segment/index calcLineCache', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('dispatches to corresponding generator', () => {
    jest.isolateModules(() => {
      const genLinearSegments = jest.fn(() => ({ name: 'linear' }));
      const genBasisSegments = jest.fn(() => ({ name: 'basis' }));
      const genMonotoneXSegments = jest.fn(() => ({ name: 'monotoneX' }));
      const genMonotoneYSegments = jest.fn(() => ({ name: 'monotoneY' }));
      const genStepSegments = jest.fn(() => ({ name: 'step' }));
      const genStepClosedSegments = jest.fn(() => ({ name: 'stepClosed' }));
      const genLinearClosedSegments = jest.fn(() => ({ name: 'linearClosed' }));
      const genCatmullRomSegments = jest.fn(() => ({ name: 'catmullRom' }));
      const genCatmullRomClosedSegments = jest.fn(() => ({ name: 'catmullRomClosed' }));

      jest.doMock('../../../../src/common/segment/linear', () => ({ genLinearSegments }));
      jest.doMock('../../../../src/common/segment/basis', () => ({ genBasisSegments }));
      jest.doMock('../../../../src/common/segment/monotone', () => ({ genMonotoneXSegments, genMonotoneYSegments }));
      jest.doMock('../../../../src/common/segment/step', () => ({ genStepSegments, genStepClosedSegments }));
      jest.doMock('../../../../src/common/segment/linear-closed', () => ({ genLinearClosedSegments }));
      jest.doMock('../../../../src/common/segment/catmull-rom', () => ({ genCatmullRomSegments }));
      jest.doMock('../../../../src/common/segment/catmull-rom-close', () => ({ genCatmullRomClosedSegments }));

      const { calcLineCache } = require('../../../../src/common/segment/index');
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ];

      expect(calcLineCache(points as any, 'linear' as any)).toEqual({ name: 'linear' });
      expect(genLinearSegments).toHaveBeenCalledWith(points, undefined);

      expect(calcLineCache(points as any, 'basis' as any)).toEqual({ name: 'basis' });
      expect(genBasisSegments).toHaveBeenCalledWith(points, undefined);

      expect(calcLineCache(points as any, 'monotoneX' as any)).toEqual({ name: 'monotoneX' });
      expect(genMonotoneXSegments).toHaveBeenCalledWith(points, undefined);

      expect(calcLineCache(points as any, 'monotoneY' as any)).toEqual({ name: 'monotoneY' });
      expect(genMonotoneYSegments).toHaveBeenCalledWith(points, undefined);

      expect(calcLineCache(points as any, 'step' as any)).toEqual({ name: 'step' });
      expect(genStepSegments).toHaveBeenCalledWith(points, 0.5, undefined);

      expect(calcLineCache(points as any, 'stepClosed' as any)).toEqual({ name: 'stepClosed' });
      expect(genStepClosedSegments).toHaveBeenCalledWith(points, 0.5, undefined);

      expect(calcLineCache(points as any, 'stepBefore' as any)).toEqual({ name: 'step' });
      expect(genStepSegments).toHaveBeenCalledWith(points, 0, undefined);

      expect(calcLineCache(points as any, 'stepAfter' as any)).toEqual({ name: 'step' });
      expect(genStepSegments).toHaveBeenCalledWith(points, 1, undefined);

      expect(calcLineCache(points as any, 'linearClosed' as any)).toEqual({ name: 'linearClosed' });
      expect(genLinearClosedSegments).toHaveBeenCalledWith(points, undefined);

      expect(calcLineCache(points as any, 'catmullRom' as any)).toEqual({ name: 'catmullRom' });
      expect(genCatmullRomSegments).toHaveBeenCalledWith(points, 0.5, undefined);

      expect(calcLineCache(points as any, 'catmullRom' as any, { curveTension: 0.2 } as any)).toEqual({ name: 'catmullRom' });
      expect(genCatmullRomSegments).toHaveBeenLastCalledWith(points, 0.2, { curveTension: 0.2 });

      expect(calcLineCache(points as any, 'catmullRomClosed' as any)).toEqual({ name: 'catmullRomClosed' });
      expect(genCatmullRomClosedSegments).toHaveBeenCalledWith(points, 0.5, undefined);

      expect(calcLineCache(points as any, 'unknown' as any)).toEqual({ name: 'linear' });
    });
  });
});
