import { container, glyphModule, registerGlyphGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { glyphCanvasPickModule } from '../picker/contributions/canvas-picker/glyph-module';
import { glyphMathPickModule } from '../picker/contributions/math-picker/glyph-module';

function _registerGlyph() {
  if (_registerGlyph.__loaded) {
    return;
  }
  _registerGlyph.__loaded = true;
  registerGlyphGraphic();
  container.load(glyphModule);
  container.load(browser ? glyphCanvasPickModule : glyphMathPickModule);
}

_registerGlyph.__loaded = false;

export const registerGlyph = _registerGlyph;
