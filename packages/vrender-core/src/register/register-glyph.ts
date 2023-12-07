import { createGlyph } from '../graphic/glyph';
import { graphicCreator } from '../graphic/graphic-creator';

export function registerGlyphGraphic() {
  graphicCreator.RegisterGraphicCreator('glyph', createGlyph);
}
