import { registerImageGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasImagePicker } from '../picker/contributions/canvas-picker/image-module';
import { registerMathImagePicker } from '../picker/contributions/math-picker/image-module';

function _registerImage() {
  if (_registerImage.__loaded) {
    return;
  }
  _registerImage.__loaded = true;
  registerImageGraphic();
  // image renderer registered via core; no /* removed container */ usage
  if (browser) {
    registerCanvasImagePicker();
  } else {
    registerMathImagePicker();
  }
}

_registerImage.__loaded = false;

export const registerImage = _registerImage;
