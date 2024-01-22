import { container, lineModule, registerLineGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { lineCanvasPickModule } from '../picker/contributions/canvas-picker/line-module';
import { lineMathPickModule } from '../picker/contributions/math-picker/line-module';

function _registerLine() {
  if (_registerLine.__loaded) {
    return;
  }
  _registerLine.__loaded = true;
  registerLineGraphic();
  container.load(lineModule);
  container.load(browser ? lineCanvasPickModule : lineMathPickModule);
}

_registerLine.__loaded = false;

export const registerLine = _registerLine;
