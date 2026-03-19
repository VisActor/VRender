describe('picker/canvas-module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('canvasPickerModule binds/rebinds correctly', () => {
    jest.isolateModules(() => {
      const bind = jest.fn(() => ({ toSelf: () => ({ inSingletonScope: jest.fn() }), toService: jest.fn() }));
      const rebind = jest.fn(() => ({ toService: jest.fn() }));

      jest.doMock('@visactor/vrender-core', () => {
        class ContainerModule {
          registry: any;
          constructor(fn: any) {
            this.registry = fn;
          }
        }
        return {
          ContainerModule,
          PickerService: 'PickerService'
        };
      });

      jest.doMock('../../../src/picker/canvas-picker-service', () => ({
        DefaultCanvasPickerService: class DefaultCanvasPickerService {}
      }));

      const canvasContributionModule = { id: 'canvasContributionModule' };
      jest.doMock('../../../src/picker/contributions/canvas-picker/module', () => ({
        __esModule: true,
        default: canvasContributionModule
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../../../src/picker/canvas-module');
      const DefaultCanvasPickerService = require('../../../src/picker/canvas-picker-service').DefaultCanvasPickerService;

      // isBound(DefaultCanvasPickerService)=false, isBound(PickerService)=true
      (mod.canvasPickerModule as any).registry(
        bind,
        jest.fn(),
        (token: any) => token === 'PickerService',
        rebind
      );

      expect(bind).toHaveBeenCalledWith(DefaultCanvasPickerService);
      expect(rebind).toHaveBeenCalledWith('PickerService');

      bind.mockClear();
      rebind.mockClear();

      // isBound(DefaultCanvasPickerService)=true, isBound(PickerService)=false
      (mod.canvasPickerModule as any).registry(
        bind,
        jest.fn(),
        (token: any) => token === DefaultCanvasPickerService,
        rebind
      );

      expect(bind).toHaveBeenCalledWith('PickerService');
      expect(rebind).not.toHaveBeenCalled();
    });
  });

  test('loadCanvasPicker loads modules in order', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => {
        class ContainerModule {
          registry: any;
          constructor(fn: any) {
            this.registry = fn;
          }
        }
        return {
          ContainerModule,
          PickerService: 'PickerService'
        };
      });
      jest.doMock('../../../src/picker/canvas-picker-service', () => ({
        DefaultCanvasPickerService: class DefaultCanvasPickerService {}
      }));

      const canvasContributionModule = { id: 'canvasContributionModule' };
      jest.doMock('../../../src/picker/contributions/canvas-picker/module', () => ({
        __esModule: true,
        default: canvasContributionModule
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { canvasPickerModule, loadCanvasPicker } = require('../../../src/picker/canvas-module');

      const c = { load: jest.fn() };
      loadCanvasPicker(c as any);
      expect(c.load).toHaveBeenNthCalledWith(1, canvasContributionModule);
      expect(c.load).toHaveBeenNthCalledWith(2, canvasPickerModule);
    });
  });
});
