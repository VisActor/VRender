declare const require: any;
export {};

describe('pyramid3d canvas picker compatibility', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should skip binding when Pyramid3dRender is not registered', () => {
    jest.isolateModules(() => {
      const bind = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        Pyramid3dRender: 'Pyramid3dRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/pyramid3d-picker', () => ({
        DefaultCanvasPyramid3dPicker: class DefaultCanvasPyramid3dPicker {}
      }));

      const {
        bindPyramid3dCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/pyramid3d-module');

      bindPyramid3dCanvasPickerContribution({
        bind,
        isBound: jest.fn(() => false)
      });

      expect(bind).not.toHaveBeenCalled();
    });
  });

  test('should bind after Pyramid3dRender becomes available', () => {
    jest.isolateModules(() => {
      const inSingletonScope = jest.fn();
      const toDynamicValue = jest.fn(() => ({ inSingletonScope }));
      const toService = jest.fn();
      const bind = jest.fn(() => ({ toDynamicValue, toService }));

      jest.doMock('@visactor/vrender-core', () => ({
        Pyramid3dRender: 'Pyramid3dRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn(() => ({ id: 'pyramid3d-renderer' }))
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/pyramid3d-picker', () => ({
        DefaultCanvasPyramid3dPicker: class DefaultCanvasPyramid3dPicker {}
      }));

      const {
        bindPyramid3dCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/pyramid3d-module');

      bindPyramid3dCanvasPickerContribution({
        bind,
        isBound: jest.fn(token => token === 'Pyramid3dRender')
      });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      expect(inSingletonScope).toHaveBeenCalledTimes(1);
      expect(toService).toHaveBeenCalledTimes(1);
    });
  });
});
