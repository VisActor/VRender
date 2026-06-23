/* eslint-disable @typescript-eslint/no-var-requires */

describe('picker contribution explicit bindings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindArcCanvasPickerContribution should bind once without ContainerModule wrapper', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        ArcRender: 'ArcRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/arc-picker', () => ({
        DefaultCanvasArcPicker: class DefaultCanvasArcPicker {}
      }));

      const mod = require('../../../src/picker/contributions/canvas-picker/arc-module');

      mod.bindArcCanvasPickerContribution({ bind });
      mod.bindArcCanvasPickerContribution({ bind });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('bindGifImageCanvasPickerContribution should bind once without ContainerModule wrapper', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({}));
      jest.doMock('../../../src/picker/contributions/canvas-picker/gif-image-picker', () => ({
        DefaultCanvasGifImagePicker: class DefaultCanvasGifImagePicker {}
      }));

      const mod = require('../../../src/picker/contributions/canvas-picker/gif-image-module');

      mod.bindGifImageCanvasPickerContribution({ bind });
      mod.bindGifImageCanvasPickerContribution({ bind });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('bindArcMathPickerContribution should bind once without ContainerModule wrapper', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        ArcRender: 'ArcRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/arc-picker', () => ({
        DefaultMathArcPicker: class DefaultMathArcPicker {}
      }));

      const mod = require('../../../src/picker/contributions/math-picker/arc-module');

      mod.bindArcMathPickerContribution({ bind });
      mod.bindArcMathPickerContribution({ bind });

      expect(bind).toHaveBeenCalledTimes(2);
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('bindCanvasPickerContribution should register group picker through explicit factory', () => {
    jest.isolateModules(() => {
      const bindContributionProvider = jest.fn();
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        bindContributionProvider,
        container: {}
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/group-picker', () => ({
        DefaultCanvasGroupPicker: class DefaultCanvasGroupPicker {}
      }));

      const mod = require('../../../src/picker/contributions/canvas-picker/module');

      mod.bindCanvasPickerContribution({ bind });

      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      expect(bindContributionProvider).toHaveBeenCalledTimes(1);
    });
  });

  test('bindImageMathPickerContribution should register MathPickerContribution through explicit instance binding', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const toService = jest.fn();
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService
      }));

      jest.doMock('../../../src/picker/contributions/math-picker/image-picker', () => ({
        DefaultMathImagePicker: class DefaultMathImagePicker {}
      }));

      const mod = require('../../../src/picker/contributions/math-picker/image-module');

      mod.bindImageMathPickerContribution({ bind });

      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      expect(toService).toHaveBeenCalled();
    });
  });

  test('bindRichTextMathPickerContribution should register the richtext picker explicitly', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toDynamicValue,
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        RichTextRender: 'RichTextRender'
      }));
      jest.doMock('../../../src/common/explicit-binding', () => ({
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/richtext-picker', () => ({
        DefaultMathRichTextPicker: class DefaultMathRichTextPicker {}
      }));

      const mod = require('../../../src/picker/contributions/math-picker/richtext-module');

      mod.bindRichTextMathPickerContribution({ bind });

      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('bindRectCanvasPickerContribution should create picker through explicit factory', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        toDynamicValue,
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        RectRender: 'RectRender',
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/canvas-picker/rect-picker', () => ({
        DefaultCanvasRectPicker: class DefaultCanvasRectPicker {}
      }));

      const mod = require('../../../src/picker/contributions/canvas-picker/rect-module');

      mod.bindRectCanvasPickerContribution({ bind });

      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('bindRectMathPickerContribution should create picker through explicit factory', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        toDynamicValue,
        to: jest.fn(() => ({ inSingletonScope: jest.fn() })),
        toService: jest.fn()
      }));

      jest.doMock('@visactor/vrender-core', () => ({
        RectRender: 'RectRender',
        resolveContainerBinding: jest.fn()
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/rect-picker', () => ({
        DefaultMathRectPicker: class DefaultMathRectPicker {}
      }));

      const mod = require('../../../src/picker/contributions/math-picker/rect-module');

      mod.bindRectMathPickerContribution({ bind });

      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });
});
