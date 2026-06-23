import { getLegacyBindingContext, graphicCreator } from '@visactor/vrender-core';
import { createGifImage } from '../graphic/gif-image';
import { bindGifImageRenderContribution } from '../render/contributions/canvas/gif-image-module';
import { bindGifImageCanvasPickerContribution } from '../picker/contributions/canvas-picker/gif-image-module';

export function registerGifGraphic() {
  graphicCreator.RegisterGraphicCreator('gif', createGifImage);
}

function _registerGifImage() {
  if (_registerGifImage.__loaded) {
    return;
  }
  _registerGifImage.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerGifGraphic();
  bindGifImageRenderContribution(legacyContext);
  bindGifImageCanvasPickerContribution(legacyContext);
}

_registerGifImage.__loaded = false;

export const registerGifImage = _registerGifImage;
