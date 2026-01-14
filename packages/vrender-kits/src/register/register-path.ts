import {
  contributionRegistry,
  DefaultCanvasPathRender,
  GraphicRender,
  registerPathGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasPathPicker } from '../picker/contributions/canvas-picker/path-module';
import { registerMathPathPicker } from '../picker/contributions/math-picker/path-module';

function _registerPath() {
  if (_registerPath.__loaded) {
    return;
  }
  _registerPath.__loaded = true;
  registerPathGraphic();
  if (browser) {
    registerCanvasPathPicker();
  } else {
    registerMathPathPicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasPathRender());
}

_registerPath.__loaded = false;

export const registerPath = _registerPath;
