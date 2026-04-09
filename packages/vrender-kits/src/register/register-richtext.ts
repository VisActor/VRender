import { getLegacyBindingContext, registerRichtextGraphic, richtextModule } from '@visactor/vrender-core';
import { browser } from './env';
import { bindRichtextCanvasPickerContribution } from '../picker/contributions/canvas-picker/richtext-module';
import { bindRichTextMathPickerContribution } from '../picker/contributions/math-picker/richtext-module';

function _registerRichtext() {
  if (_registerRichtext.__loaded) {
    return;
  }
  _registerRichtext.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerRichtextGraphic();
  (richtextModule as any)({ bind: legacyContext.bind });
  browser ? bindRichtextCanvasPickerContribution(legacyContext) : bindRichTextMathPickerContribution(legacyContext);
}

_registerRichtext.__loaded = false;

export const registerRichtext = _registerRichtext;
