declare const require: any;
export {};

describe('star canvas picker compatibility', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should skip binding when StarRender is not registered', () => {
    jest.isolateModules(() => {
      const bind = jest.fn();

      jest.doMock('@visactor/vrender-core', () => ({
        StarRender: 'StarRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/star-picker', () => ({
        DefaultCanvasStarPicker: class DefaultCanvasStarPicker {}
      }));

      const {
        bindStarCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/star-module');

      bindStarCanvasPickerContribution({
        bind,
        isBound: jest.fn(() => false)
      });

      expect(bind).not.toHaveBeenCalled();
    });
  });

  test('should bind after StarRender becomes available', () => {
    jest.isolateModules(() => {
      const inSingletonScope = jest.fn();
      const toDynamicValue = jest.fn(() => ({ inSingletonScope }));
      const toService = jest.fn();
      const bind = jest.fn(() => ({ toDynamicValue, toService }));

      jest.doMock('@visactor/vrender-core', () => ({
        StarRender: 'StarRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn(() => ({ id: 'star-renderer' }))
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/star-picker', () => ({
        DefaultCanvasStarPicker: class DefaultCanvasStarPicker {}
      }));

      const {
        bindStarCanvasPickerContribution
      } = require('../../../src/picker/contributions/canvas-picker/star-module');

      bindStarCanvasPickerContribution({
        bind,
        isBound: jest.fn(token => token === 'StarRender')
      });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      expect(inSingletonScope).toHaveBeenCalledTimes(1);
      expect(toService).toHaveBeenCalledTimes(1);
    });
  });
});
