describe('vrender-kits commonStrokeCb', () => {
  test('keepStrokeScale=true uses raw lineWidth + buffer', () => {
    jest.resetModules();

    const getScaledStroke = jest.fn();
    jest.doMock('@visactor/vrender-core', () => ({
      getScaledStroke
    }));

    jest.isolateModules(() => {
      const { commonStrokeCb } = require('../../../src/picker/contributions/common/picker-utils');

      const context: any = {
        isPointInStroke: jest.fn().mockReturnValue(true)
      };
      const pickContext: any = {
        dpr: 2,
        lineWidth: 0
      };

      const symbolAttribute: any = {
        lineWidth: 2,
        pickStrokeBuffer: 1,
        keepStrokeScale: true
      };
      const themeAttribute: any = {
        lineWidth: 10,
        pickStrokeBuffer: 5,
        keepStrokeScale: false
      };

      const out = commonStrokeCb(context, pickContext, symbolAttribute, themeAttribute, { x: 1, y: 2 } as any);

      expect(out).toBe(true);
      expect(pickContext.lineWidth).toBe(3);
      expect(context.isPointInStroke).toHaveBeenCalledWith(1, 2);
      expect(getScaledStroke).not.toHaveBeenCalled();
    });
  });

  test('keepStrokeScale=false uses getScaledStroke', () => {
    jest.resetModules();

    const getScaledStroke = jest.fn().mockReturnValue(123);
    jest.doMock('@visactor/vrender-core', () => ({
      getScaledStroke
    }));

    jest.isolateModules(() => {
      const { commonStrokeCb } = require('../../../src/picker/contributions/common/picker-utils');

      const context: any = {
        isPointInStroke: jest.fn().mockReturnValue(false)
      };
      const pickContext: any = {
        dpr: 3,
        lineWidth: 0
      };

      const symbolAttribute: any = {
        lineWidth: 4,
        pickStrokeBuffer: 2,
        keepStrokeScale: false
      };
      const themeAttribute: any = {
        lineWidth: 1,
        pickStrokeBuffer: 1,
        keepStrokeScale: false
      };

      const out = commonStrokeCb(context, pickContext, symbolAttribute, themeAttribute, { x: 0, y: 0 } as any);

      expect(out).toBe(false);
      expect(getScaledStroke).toHaveBeenCalledWith(pickContext, 6, 3);
      expect(pickContext.lineWidth).toBe(123);
    });
  });
});
