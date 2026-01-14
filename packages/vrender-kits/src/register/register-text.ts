import {
  contributionRegistry,
  DefaultCanvasTextRender,
  GraphicRender,
  registerTextGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasTextPicker } from '../picker/contributions/canvas-picker/text-module';
import { registerMathTextPicker } from '../picker/contributions/math-picker/text-module';
function _registerText() {
  if (_registerText.__loaded) {
    return;
  }
  _registerText.__loaded = true;
  registerTextGraphic();
  if (browser) {
    registerCanvasTextPicker();
  } else {
    registerMathTextPicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasTextRender());
}

_registerText.__loaded = false;

export const registerText = _registerText;
