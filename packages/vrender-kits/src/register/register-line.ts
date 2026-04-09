import { getLegacyBindingContext, lineModule, registerLineGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindLineCanvasPickerContribution } from '../picker/contributions/canvas-picker/line-module';
import { bindLineMathPickerContribution } from '../picker/contributions/math-picker/line-module';

function _registerLine() {
  if (_registerLine.__loaded) {
    return;
  }
  _registerLine.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerLineGraphic();
  (lineModule as any)({ bind: legacyContext.bind });
  browser ? bindLineCanvasPickerContribution(legacyContext) : bindLineMathPickerContribution(legacyContext);
}

_registerLine.__loaded = false;

export const registerLine = _registerLine;
