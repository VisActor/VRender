import {
  contributionRegistry,
  DefaultCanvasLineRender,
  GraphicRender,
  registerLineGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasLinePicker } from '../picker/contributions/canvas-picker/line-module';
import { registerMathLinePicker } from '../picker/contributions/math-picker/line-module';

function _registerLine() {
  if (_registerLine.__loaded) {
    return;
  }
  _registerLine.__loaded = true;
  registerLineGraphic();
  if (browser) {
    registerCanvasLinePicker();
  } else {
    registerMathLinePicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasLineRender());
}

_registerLine.__loaded = false;

export const registerLine = _registerLine;
