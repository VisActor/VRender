import { container, registerTextGraphic, textModule } from '@visactor/vrender-core';
import { browser } from './env';
import { textCanvasPickModule } from '../picker/contributions/canvas-picker/text-module';
import { textMathPickModule } from '../picker/contributions/math-picker/text-module';
function _registerText() {
  if (_registerText.__loaded) {
    return;
  }
  _registerText.__loaded = true;
  registerTextGraphic();
  container.load(textModule);
  container.load(browser ? textCanvasPickModule : textMathPickModule);
}

_registerText.__loaded = false;

export const registerText = _registerText;
