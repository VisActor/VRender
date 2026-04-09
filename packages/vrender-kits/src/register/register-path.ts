import { getLegacyBindingContext, pathModule, registerPathGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindPathCanvasPickerContribution } from '../picker/contributions/canvas-picker/path-module';
import { bindPathMathPickerContribution } from '../picker/contributions/math-picker/path-module';

function _registerPath() {
  if (_registerPath.__loaded) {
    return;
  }
  _registerPath.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerPathGraphic();
  (pathModule as any)({ bind: legacyContext.bind });
  browser ? bindPathCanvasPickerContribution(legacyContext) : bindPathMathPickerContribution(legacyContext);
}

_registerPath.__loaded = false;

export const registerPath = _registerPath;
