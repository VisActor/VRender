import { registerArcGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasArcPicker } from '../picker/contributions/canvas-picker/arc-module';
import { registerMathArcPicker } from '../picker/contributions/math-picker/arc-module';

export function _registerArc() {
  if (_registerArc.__loaded) {
    return;
  }
  _registerArc.__loaded = true;
  registerArcGraphic();
  if (browser) {
    registerCanvasArcPicker();
  } else {
    registerMathArcPicker();
  }
}

_registerArc.__loaded = false;

export const registerArc = _registerArc;
