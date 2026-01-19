import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasGlyphPicker } from './glyph-picker';

let _registeredGlyph = false;
export function registerCanvasGlyphPicker() {
  if (_registeredGlyph) {
    return;
  }
  _registeredGlyph = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasGlyphPicker());
}
