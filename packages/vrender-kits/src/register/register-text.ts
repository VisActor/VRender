import { getLegacyBindingContext, registerTextGraphic, textModule } from '@visactor/vrender-core';
import { browser } from './env';
import { bindTextCanvasPickerContribution } from '../picker/contributions/canvas-picker/text-module';
import { bindTextMathPickerContribution } from '../picker/contributions/math-picker/text-module';
function _registerText() {
  if (_registerText.__loaded) {
    return;
  }
  _registerText.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerTextGraphic();
  (textModule as any)({ bind: legacyContext.bind });
  browser ? bindTextCanvasPickerContribution(legacyContext) : bindTextMathPickerContribution(legacyContext);
}

_registerText.__loaded = false;

export const registerText = _registerText;
