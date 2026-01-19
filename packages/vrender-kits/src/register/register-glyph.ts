import {
  contributionRegistry,
  DefaultCanvasGlyphRender,
  GraphicRender,
  registerGlyphGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasGlyphPicker } from '../picker/contributions/canvas-picker/glyph-module';
import { registerMathGlyphPicker } from '../picker/contributions/math-picker/glyph-module';

function _registerGlyph() {
  if (_registerGlyph.__loaded) {
    return;
  }
  _registerGlyph.__loaded = true;
  registerGlyphGraphic();
  if (browser) {
    registerCanvasGlyphPicker();
  } else {
    registerMathGlyphPicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasGlyphRender());
}

_registerGlyph.__loaded = false;

export const registerGlyph = _registerGlyph;
