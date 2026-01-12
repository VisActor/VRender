import { registerCircleGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasCirclePicker } from '../picker/contributions/canvas-picker/circle-module';
import { registerMathCirclePicker } from '../picker/contributions/math-picker/circle-module';

function _registerCircle() {
  if (_registerCircle.__loaded) {
    return;
  }
  _registerCircle.__loaded = true;
  registerCircleGraphic();
  // circle renderer registered via core; no container usage
  if (browser) {
    registerCanvasCirclePicker();
  } else {
    registerMathCirclePicker();
  }
}

_registerCircle.__loaded = false;

export const registerCircle = _registerCircle;
