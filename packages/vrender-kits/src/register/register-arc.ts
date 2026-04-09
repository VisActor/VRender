import { arcModule, getLegacyBindingContext, registerArcGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindArcCanvasPickerContribution } from '../picker/contributions/canvas-picker/arc-module';
import { bindArcMathPickerContribution } from '../picker/contributions/math-picker/arc-module';

export function _registerArc() {
  if (_registerArc.__loaded) {
    return;
  }
  _registerArc.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerArcGraphic();
  (arcModule as any)({ bind: legacyContext.bind });
  browser ? bindArcCanvasPickerContribution(legacyContext) : bindArcMathPickerContribution(legacyContext);
}

_registerArc.__loaded = false;

export const registerArc = _registerArc;
