import { registerAreaGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasAreaPicker } from '../picker/contributions/canvas-picker/area-module';
import { registerMathAreaPicker } from '../picker/contributions/math-picker/area-module';

function _registerArea() {
  if (_registerArea.__loaded) {
    return;
  }
  _registerArea.__loaded = true;
  registerAreaGraphic();
  // area renderer registered via core; no container usage
  if (browser) {
    registerCanvasAreaPicker();
  } else {
    registerMathAreaPicker();
  }
}

_registerArea.__loaded = false;

export const registerArea = _registerArea;
