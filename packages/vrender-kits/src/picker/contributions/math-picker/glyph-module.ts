import { ContainerModule } from '@visactor/vrender-core';
import { MathGlyphPicker } from '../constants';
import { DefaultMathGlyphPicker } from './glyph-picker';

let loadGlyphPick = false;
export const glyphMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadGlyphPick) {
    return;
  }
  loadGlyphPick = true;
  // glyph picker
  bind(MathGlyphPicker).to(DefaultMathGlyphPicker).inSingletonScope();
  bind(DefaultMathGlyphPicker).toService(MathGlyphPicker);
});
