describe('picker/canvas-module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindCanvasPicker binds/rebinds correctly', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        toDynamicValue,
        toSelf: () => ({ inSingletonScope: jest.fn() }),
        toService: jest.fn()
      }));
      const rebind = jest.fn(() => ({ toService: jest.fn() }));

      jest.doMock('@visactor/vrender-core', () => {
        return {
          DrawContribution: 'DrawContribution',
          PickItemInterceptor: 'PickItemInterceptor',
          PickServiceInterceptor: 'PickServiceInterceptor',
          PickerService: 'PickerService',
          createContributionProvider: jest.fn(),
          resolveContainerBinding: jest.fn()
        };
      });

      jest.doMock('../../../src/picker/canvas-picker-service', () => ({
        DefaultCanvasPickerService: class DefaultCanvasPickerService {}
      }));

      const bindCanvasPickerContribution = jest.fn();
      jest.doMock('../../../src/picker/contributions/canvas-picker/module', () => ({
        bindCanvasPickerContribution
      }));
      const bindArcCanvasPickerContribution = jest.fn();
      const bindArc3dCanvasPickerContribution = jest.fn();
      const bindAreaCanvasPickerContribution = jest.fn();
      const bindCircleCanvasPickerContribution = jest.fn();
      const bindGlyphCanvasPickerContribution = jest.fn();
      const bindImageCanvasPickerContribution = jest.fn();
      const bindLineCanvasPickerContribution = jest.fn();
      const bindLottieCanvasPickerContribution = jest.fn();
      const bindPathCanvasPickerContribution = jest.fn();
      const bindPolygonCanvasPickerContribution = jest.fn();
      const bindPyramid3dCanvasPickerContribution = jest.fn();
      const bindRectCanvasPickerContribution = jest.fn();
      const bindRect3dCanvasPickerContribution = jest.fn();
      const bindRichtextCanvasPickerContribution = jest.fn();
      const bindStarCanvasPickerContribution = jest.fn();
      const bindSymbolCanvasPickerContribution = jest.fn();
      const bindTextCanvasPickerContribution = jest.fn();
      const bindGifImageCanvasPickerContribution = jest.fn();
      jest.doMock('../../../src/picker/contributions/canvas-picker/arc-module', () => ({
        bindArcCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/arc3d-module', () => ({
        bindArc3dCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/area-module', () => ({
        bindAreaCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/circle-module', () => ({
        bindCircleCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/glyph-module', () => ({
        bindGlyphCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/image-module', () => ({
        bindImageCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/line-module', () => ({
        bindLineCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/lottie-module', () => ({
        bindLottieCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/path-module', () => ({
        bindPathCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/polygon-module', () => ({
        bindPolygonCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/pyramid3d-module', () => ({
        bindPyramid3dCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/rect-module', () => ({
        bindRectCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/rect3d-module', () => ({
        bindRect3dCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/richtext-module', () => ({
        bindRichtextCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/star-module', () => ({
        bindStarCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/symbol-module', () => ({
        bindSymbolCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/text-module', () => ({
        bindTextCanvasPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/gif-image-module', () => ({
        bindGifImageCanvasPickerContribution
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const mod = require('../../../src/picker/canvas-module');
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const canvasPickerServiceModule = require('../../../src/picker/canvas-picker-service');
      const DefaultCanvasPickerService = canvasPickerServiceModule.DefaultCanvasPickerService;

      // isBound(DefaultCanvasPickerService)=false, isBound(PickerService)=true
      mod.bindCanvasPicker({
        bind,
        rebind,
        load: jest.fn(),
        isBound: (token: any) => token === 'PickerService'
      });

      expect(bind).toHaveBeenCalledWith(DefaultCanvasPickerService);
      expect(rebind).toHaveBeenCalledWith('PickerService');
      expect(toDynamicValue).toHaveBeenCalledTimes(1);

      bind.mockClear();
      rebind.mockClear();

      // isBound(DefaultCanvasPickerService)=true, isBound(PickerService)=false
      mod.bindCanvasPicker({
        bind,
        rebind,
        load: jest.fn(),
        isBound: (token: any) => token === DefaultCanvasPickerService
      });

      expect(bind).toHaveBeenCalledWith('PickerService');
      expect(rebind).not.toHaveBeenCalled();
    });
  });

  test('loadCanvasPicker loads modules in order', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => {
        return {
          PickerService: 'PickerService'
        };
      });
      jest.doMock('../../../src/picker/canvas-picker-service', () => ({
        DefaultCanvasPickerService: class DefaultCanvasPickerService {}
      }));

      const bindCanvasPickerContribution = jest.fn();
      jest.doMock('../../../src/picker/contributions/canvas-picker/module', () => ({
        bindCanvasPickerContribution
      }));
      const leafBindMocks = [
        ['../../../src/picker/contributions/canvas-picker/arc-module', 'bindArcCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/arc3d-module', 'bindArc3dCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/area-module', 'bindAreaCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/circle-module', 'bindCircleCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/glyph-module', 'bindGlyphCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/image-module', 'bindImageCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/line-module', 'bindLineCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/lottie-module', 'bindLottieCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/path-module', 'bindPathCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/polygon-module', 'bindPolygonCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/pyramid3d-module', 'bindPyramid3dCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/rect-module', 'bindRectCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/rect3d-module', 'bindRect3dCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/richtext-module', 'bindRichtextCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/star-module', 'bindStarCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/symbol-module', 'bindSymbolCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/text-module', 'bindTextCanvasPickerContribution'],
        ['../../../src/picker/contributions/canvas-picker/gif-image-module', 'bindGifImageCanvasPickerContribution']
      ] as const;
      const leafBindFns = leafBindMocks.map(([path, key]) => {
        const fn = jest.fn();
        jest.doMock(path, () => ({ [key]: fn }));
        return fn;
      });

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { loadCanvasPicker } = require('../../../src/picker/canvas-module');

      const c = {
        bind: jest.fn(() => ({
          toDynamicValue: () => ({ inSingletonScope: jest.fn() }),
          toSelf: () => ({ inSingletonScope: jest.fn() }),
          toService: jest.fn()
        })),
        rebind: jest.fn(() => ({ toService: jest.fn() })),
        isBound: jest.fn(() => false),
        load: jest.fn()
      };
      loadCanvasPicker(c as any);
      expect(bindCanvasPickerContribution).toHaveBeenCalledWith(c);
      leafBindFns.forEach(fn => {
        expect(fn).toHaveBeenCalledWith(c);
      });
      expect(c.load).toHaveBeenCalledTimes(0);
      expect(c.bind).toHaveBeenCalled();
    });
  });
});
