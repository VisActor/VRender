import { application } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasGlyphPicker } from './glyph-picker';

let _registeredGlyph = false;
export function registerCanvasGlyphPicker() {
  if (_registeredGlyph) {
    return;
  }
  _registeredGlyph = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasGlyphPicker());
}
