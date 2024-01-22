import { container, registerSymbolGraphic, symbolModule } from '@visactor/vrender-core';
import { browser } from './env';
import { symbolCanvasPickModule } from '../picker/contributions/canvas-picker/symbol-module';
import { symbolMathPickModule } from '../picker/contributions/math-picker/symbol-module';

function _registerSymbol() {
  if (_registerSymbol.__loaded) {
    return;
  }
  _registerSymbol.__loaded = true;
  registerSymbolGraphic();
  container.load(symbolModule);
  container.load(browser ? symbolCanvasPickModule : symbolMathPickModule);
}

_registerSymbol.__loaded = false;

export const registerSymbol = _registerSymbol;
