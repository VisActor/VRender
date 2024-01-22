import { container, rectModule, registerRectGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { rectCanvasPickModule } from '../picker/contributions/canvas-picker/rect-module';
import { rectMathPickModule } from '../picker/contributions/math-picker/rect-module';

function _registerRect() {
  if (_registerRect.__loaded) {
    return;
  }
  _registerRect.__loaded = true;
  registerRectGraphic();
  container.load(rectModule);
  container.load(browser ? rectCanvasPickModule : rectMathPickModule);
}

_registerRect.__loaded = false;

export const registerRect = _registerRect;
