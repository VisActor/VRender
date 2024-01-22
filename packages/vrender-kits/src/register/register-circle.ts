import { circleModule, container, registerCircleGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { circleCanvasPickModule } from '../picker/contributions/canvas-picker/circle-module';
import { circleMathPickModule } from '../picker/contributions/math-picker/circle-module';

function _registerCircle() {
  if (_registerCircle.__loaded) {
    return;
  }
  _registerCircle.__loaded = true;
  registerCircleGraphic();
  container.load(circleModule);
  container.load(browser ? circleCanvasPickModule : circleMathPickModule);
}

_registerCircle.__loaded = false;

export const registerCircle = _registerCircle;
