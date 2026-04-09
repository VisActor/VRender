import { getLegacyBindingContext, imageModule, registerImageGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindImageCanvasPickerContribution } from '../picker/contributions/canvas-picker/image-module';
import { bindImageMathPickerContribution } from '../picker/contributions/math-picker/image-module';

function _registerImage() {
  if (_registerImage.__loaded) {
    return;
  }
  _registerImage.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerImageGraphic();
  (imageModule as any)({ bind: legacyContext.bind });
  browser ? bindImageCanvasPickerContribution(legacyContext) : bindImageMathPickerContribution(legacyContext);
}

_registerImage.__loaded = false;

export const registerImage = _registerImage;
