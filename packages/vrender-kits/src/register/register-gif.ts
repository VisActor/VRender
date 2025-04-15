import { container, graphicCreator } from '@visactor/vrender-core';
import { createGifImage } from '../graphic/gif-image';
import { gifImageModule } from '../render/contributions/canvas/gif-image-module';
import { gifImageCanvasPickModule } from '../picker/contributions/canvas-picker/gif-image-module';

export function registerGifGraphic() {
  graphicCreator.RegisterGraphicCreator('gif', createGifImage);
}

function _registerGifImage() {
  if (_registerGifImage.__loaded) {
    return;
  }
  _registerGifImage.__loaded = true;
  registerGifGraphic();
  container.load(gifImageModule);
  container.load(gifImageCanvasPickModule);
}

_registerGifImage.__loaded = false;

export const registerGifImage = _registerGifImage;
