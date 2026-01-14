import {
  contributionRegistry,
  DefaultCanvasSymbolRender,
  GraphicRender,
  registerSymbolGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasSymbolPicker } from '../picker/contributions/canvas-picker/symbol-module';
import { registerMathSymbolPicker } from '../picker/contributions/math-picker/symbol-module';

function _registerSymbol() {
  if (_registerSymbol.__loaded) {
    return;
  }
  _registerSymbol.__loaded = true;
  registerSymbolGraphic();
  if (browser) {
    registerCanvasSymbolPicker();
  } else {
    registerMathSymbolPicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasSymbolRender());
}

_registerSymbol.__loaded = false;

export const registerSymbol = _registerSymbol;
