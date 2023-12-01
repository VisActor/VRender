import type { IGlyphGraphicAttribute, IGlyph } from './core';
import { container, graphicCreator, glyphModule, Glyph } from './core';
import { browser } from './isbrowser';
import { glyphCanvasPickModule, glyphMathPickModule } from './kits';

export function createGlyph(attributes: IGlyphGraphicAttribute): IGlyph {
  return new Glyph(attributes);
}

export function registerGlyph() {
  graphicCreator.RegisterGraphicCreator('glyph', createGlyph);
  container.load(glyphModule);
  container.load(browser ? glyphCanvasPickModule : glyphMathPickModule);
}
