import { contributionRegistry } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathRichTextPicker } from './richtext-picker';

let _registered = false;
export function registerMathRichTextPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(MathPickerContribution, new DefaultMathRichTextPicker());
}
