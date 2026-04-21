declare const require: any;
export {};

describe('arc3d canvas picker compatibility', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should skip binding when Arc3dRender is not registered', () => {
    jest.isolateModules(() => {
      const bind = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        Arc3dRender: 'Arc3dRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/arc3d-picker', () => ({
        DefaultCanvasArc3dPicker: class DefaultCanvasArc3dPicker {}
      }));

      const {
        bindArc3dCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/arc3d-module');

      bindArc3dCanvasPickerContribution({
        bind,
        isBound: jest.fn(() => false)
      });

      expect(bind).not.toHaveBeenCalled();
    });
  });

  test('should bind after Arc3dRender becomes available', () => {
    jest.isolateModules(() => {
      const inSingletonScope = jest.fn();
      const toDynamicValue = jest.fn(() => ({ inSingletonScope }));
      const toService = jest.fn();
      const bind = jest.fn(() => ({ toDynamicValue, toService }));

      jest.doMock('@visactor/vrender-core', () => ({
        Arc3dRender: 'Arc3dRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn(() => ({ id: 'arc3d-renderer' }))
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/arc3d-picker', () => ({
        DefaultCanvasArc3dPicker: class DefaultCanvasArc3dPicker {}
      }));

      const {
        bindArc3dCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/arc3d-module');

      bindArc3dCanvasPickerContribution({
        bind,
        isBound: jest.fn(token => token === 'Arc3dRender')
      });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      expect(inSingletonScope).toHaveBeenCalledTimes(1);
      expect(toService).toHaveBeenCalledTimes(1);
    });
  });
});
