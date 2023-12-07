import { container, glyphModule, registerGlyphGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { glyphCanvasPickModule } from '../picker/contributions/canvas-picker/glyph-module';
import { glyphMathPickModule } from '../picker/contributions/math-picker/glyph-module';

let loaded = false;
export function registerGlyph() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerGlyphGraphic();
  container.load(glyphModule);
  container.load(browser ? glyphCanvasPickModule : glyphMathPickModule);
}
