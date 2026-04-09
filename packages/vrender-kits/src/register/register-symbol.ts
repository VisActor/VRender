import { getLegacyBindingContext, registerSymbolGraphic, symbolModule } from '@visactor/vrender-core';
import { browser } from './env';
import { bindSymbolCanvasPickerContribution } from '../picker/contributions/canvas-picker/symbol-module';
import { bindSymbolMathPickerContribution } from '../picker/contributions/math-picker/symbol-module';

function _registerSymbol() {
  if (_registerSymbol.__loaded) {
    return;
  }
  _registerSymbol.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerSymbolGraphic();
  (symbolModule as any)({ bind: legacyContext.bind });
  browser ? bindSymbolCanvasPickerContribution(legacyContext) : bindSymbolMathPickerContribution(legacyContext);
}

_registerSymbol.__loaded = false;

export const registerSymbol = _registerSymbol;
