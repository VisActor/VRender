import { getLegacyBindingContext, rectModule, registerRectGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindRectCanvasPickerContribution } from '../picker/contributions/canvas-picker/rect-module';
import { bindRectMathPickerContribution } from '../picker/contributions/math-picker/rect-module';

function _registerRect() {
  if (_registerRect.__loaded) {
    return;
  }
  _registerRect.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerRectGraphic();
  (rectModule as any)({ bind: legacyContext.bind });
  browser ? bindRectCanvasPickerContribution(legacyContext) : bindRectMathPickerContribution(legacyContext);
}

_registerRect.__loaded = false;

export const registerRect = _registerRect;
