jest.mock('@visactor/vrender-core', () => ({
  getLegacyBindingContext: jest.fn(() => ({
    bind: jest.fn(),
    isBound: jest.fn(),
    rebind: jest.fn(),
    getAll: jest.fn(),
    getNamed: jest.fn()
  })),
  graphicCreator: {
    RegisterGraphicCreator: jest.fn()
  }
}));

jest.mock('../../../src/render/contributions/canvas/gif-image-module', () => ({
  bindGifImageRenderContribution: jest.fn()
}));

jest.mock('../../../src/picker/contributions/canvas-picker/gif-image-module', () => ({
  bindGifImageCanvasPickerContribution: jest.fn()
}));

jest.mock('../../../src/graphic/gif-image', () => ({
  createGifImage: jest.fn()
}));

import { getLegacyBindingContext, graphicCreator } from '@visactor/vrender-core';
import { bindGifImageRenderContribution } from '../../../src/render/contributions/canvas/gif-image-module';
import { bindGifImageCanvasPickerContribution } from '../../../src/picker/contributions/canvas-picker/gif-image-module';
import { registerGifGraphic, registerGifImage } from '../../../src/register/register-gif';

describe('register gif graphic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (registerGifImage as any).__loaded = false;
  });

  test('registerGifGraphic should use the new registerGraphic api', () => {
    registerGifGraphic();

    expect(graphicCreator.RegisterGraphicCreator).toHaveBeenCalledTimes(1);
  });

  test('registerGifImage should register once and load render/picker modules', () => {
    registerGifImage();
    registerGifImage();

    const legacyContext = (getLegacyBindingContext as jest.Mock).mock.results[0].value;
    expect(graphicCreator.RegisterGraphicCreator).toHaveBeenCalledTimes(1);
    expect(bindGifImageRenderContribution).toHaveBeenCalledTimes(1);
    expect(bindGifImageCanvasPickerContribution).toHaveBeenCalledTimes(1);
    expect(bindGifImageRenderContribution).toHaveBeenCalledWith(legacyContext);
    expect(bindGifImageCanvasPickerContribution).toHaveBeenCalledWith(legacyContext);
  });
});
