import { container, pathModule, registerPathGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { pathCanvasPickModule } from '../picker/contributions/canvas-picker/path-module';
import { pathMathPickModule } from '../picker/contributions/math-picker/path-module';

function _registerPath() {
  if (_registerPath.__loaded) {
    return;
  }
  _registerPath.__loaded = true;
  registerPathGraphic();
  container.load(pathModule);
  container.load(browser ? pathCanvasPickModule : pathMathPickModule);
}

_registerPath.__loaded = false;

export const registerPath = _registerPath;
