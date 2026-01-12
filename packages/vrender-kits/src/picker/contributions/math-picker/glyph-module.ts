import { application } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathGlyphPicker } from './glyph-picker';

let _registered = false;
export function registerMathGlyphPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(MathPickerContribution, new DefaultMathGlyphPicker());
}
