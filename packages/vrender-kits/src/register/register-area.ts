import { areaModule, getLegacyBindingContext, registerAreaGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindAreaCanvasPickerContribution } from '../picker/contributions/canvas-picker/area-module';
import { bindAreaMathPickerContribution } from '../picker/contributions/math-picker/area-module';

function _registerArea() {
  if (_registerArea.__loaded) {
    return;
  }
  _registerArea.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerAreaGraphic();
  (areaModule as any)({ bind: legacyContext.bind });
  browser ? bindAreaCanvasPickerContribution(legacyContext) : bindAreaMathPickerContribution(legacyContext);
}

_registerArea.__loaded = false;

export const registerArea = _registerArea;
