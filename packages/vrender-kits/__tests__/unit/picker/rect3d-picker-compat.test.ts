declare const require: any;
export {};

describe('rect3d canvas picker compatibility', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should skip binding when Rect3DRender is not registered', () => {
    jest.isolateModules(() => {
      const bind = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        Rect3DRender: 'Rect3DRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/rect3d-picker', () => ({
        DefaultCanvasRect3dPicker: class DefaultCanvasRect3dPicker {}
      }));

      const {
        bindRect3dCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/rect3d-module');

      bindRect3dCanvasPickerContribution({
        bind,
        isBound: jest.fn(() => false)
      });

      expect(bind).not.toHaveBeenCalled();
    });
  });

  test('should bind after Rect3DRender becomes available', () => {
    jest.isolateModules(() => {
      const inSingletonScope = jest.fn();
      const toDynamicValue = jest.fn(() => ({ inSingletonScope }));
      const toService = jest.fn();
      const bind = jest.fn(() => ({ toDynamicValue, toService }));

      jest.doMock('@visactor/vrender-core', () => ({
        Rect3DRender: 'Rect3DRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn(() => ({ id: 'rect3d-renderer' }))
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/rect3d-picker', () => ({
        DefaultCanvasRect3dPicker: class DefaultCanvasRect3dPicker {}
      }));

      const {
        bindRect3dCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/rect3d-module');

      bindRect3dCanvasPickerContribution({
        bind,
        isBound: jest.fn(token => token === 'Rect3DRender')
      });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      expect(inSingletonScope).toHaveBeenCalledTimes(1);
      expect(toService).toHaveBeenCalledTimes(1);
    });
  });
});
