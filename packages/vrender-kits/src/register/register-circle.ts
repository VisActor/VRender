import {
  contributionRegistry,
  DefaultCanvasCircleRender,
  GraphicRender,
  registerCircleGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasCirclePicker } from '../picker/contributions/canvas-picker/circle-module';
import { registerMathCirclePicker } from '../picker/contributions/math-picker/circle-module';

function _registerCircle() {
  if (_registerCircle.__loaded) {
    return;
  }
  _registerCircle.__loaded = true;
  registerCircleGraphic();
  if (browser) {
    registerCanvasCirclePicker();
  } else {
    registerMathCirclePicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasCircleRender());
}

_registerCircle.__loaded = false;

export const registerCircle = _registerCircle;
