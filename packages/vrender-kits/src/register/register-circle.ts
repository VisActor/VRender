import { circleModule, getLegacyBindingContext, registerCircleGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindCircleCanvasPickerContribution } from '../picker/contributions/canvas-picker/circle-module';
import { bindCircleMathPickerContribution } from '../picker/contributions/math-picker/circle-module';

function _registerCircle() {
  if (_registerCircle.__loaded) {
    return;
  }
  _registerCircle.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerCircleGraphic();
  (circleModule as any)({ bind: legacyContext.bind });
  browser ? bindCircleCanvasPickerContribution(legacyContext) : bindCircleMathPickerContribution(legacyContext);
}

_registerCircle.__loaded = false;

export const registerCircle = _registerCircle;
