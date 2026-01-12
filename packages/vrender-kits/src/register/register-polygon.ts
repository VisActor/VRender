import { registerPolygonGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasPolygonPicker } from '../picker/contributions/canvas-picker/polygon-module';
import { registerMathPolygonPicker } from '../picker/contributions/math-picker/polygon-module';

function _registerPolygon() {
  if (_registerPolygon.__loaded) {
    return;
  }
  _registerPolygon.__loaded = true;
  registerPolygonGraphic();
  // polygon renderer registered via core; no container usage
  if (browser) {
    registerCanvasPolygonPicker();
  } else {
    registerMathPolygonPicker();
  }
}

_registerPolygon.__loaded = false;

export const registerPolygon = _registerPolygon;
