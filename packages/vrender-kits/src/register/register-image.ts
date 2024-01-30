import { container, imageModule, registerImageGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { imageCanvasPickModule } from '../picker/contributions/canvas-picker/image-module';
import { imageMathPickModule } from '../picker/contributions/math-picker/image-module';

function _registerImage() {
  if (_registerImage.__loaded) {
    return;
  }
  _registerImage.__loaded = true;
  registerImageGraphic();
  container.load(imageModule);
  container.load(browser ? imageCanvasPickModule : imageMathPickModule);
}

_registerImage.__loaded = false;

export const registerImage = _registerImage;
