import { container, registerSymbolGraphic, symbolModule } from '@visactor/vrender-core';
import { browser } from './env';
import { symbolCanvasPickModule } from '../picker/contributions/canvas-picker/symbol-module';
import { symbolMathPickModule } from '../picker/contributions/math-picker/symbol-module';

let loaded = false;
export function registerSymbol() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerSymbolGraphic();
  container.load(symbolModule);
  container.load(browser ? symbolCanvasPickModule : symbolMathPickModule);
}
