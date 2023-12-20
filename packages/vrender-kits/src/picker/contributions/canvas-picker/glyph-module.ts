import { ContainerModule } from '@visactor/vrender-core';
import { CanvasGlyphPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGlyphPicker } from './glyph-picker';

let loadGlyphPick = false;
export const glyphCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadGlyphPick) {
    return;
  }
  loadGlyphPick = true;
  // glyph picker
  bind(CanvasGlyphPicker).to(DefaultCanvasGlyphPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGlyphPicker);
});
