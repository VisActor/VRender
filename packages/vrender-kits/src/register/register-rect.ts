import { registerRectGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasRectPicker } from '../picker/contributions/canvas-picker/rect-module';
import { registerMathRectPicker } from '../picker/contributions/math-picker/rect-module';

function _registerRect() {
  if (_registerRect.__loaded) {
    return;
  }
  _registerRect.__loaded = true;
  registerRectGraphic();
  // rect renderer registered via core; no container usage
  if (browser) {
    registerCanvasRectPicker();
  } else {
    registerMathRectPicker();
  }
}

_registerRect.__loaded = false;

export const registerRect = _registerRect;
