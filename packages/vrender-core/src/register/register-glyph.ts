import { createGlyph } from '../graphic/glyph';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerGlyphGraphic() {
  registerGraphic('glyph', createGlyph);
}
