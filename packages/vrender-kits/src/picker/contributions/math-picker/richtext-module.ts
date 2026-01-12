import { application } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathRichTextPicker } from './richtext-picker';

let _registered = false;
export function registerMathRichTextPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(MathPickerContribution, new DefaultMathRichTextPicker());
}
