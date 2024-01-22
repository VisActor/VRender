import { arcModule, container, registerArcGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { arcCanvasPickModule } from '../picker/contributions/canvas-picker/arc-module';
import { arcMathPickModule } from '../picker/contributions/math-picker/arc-module';

export function _registerArc() {
  if (_registerArc.__loaded) {
    return;
  }
  _registerArc.__loaded = true;
  registerArcGraphic();
  container.load(arcModule);
  container.load(browser ? arcCanvasPickModule : arcMathPickModule);
}

_registerArc.__loaded = false;

export const registerArc = _registerArc;
