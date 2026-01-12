import { application } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathRectPicker } from './rect-picker';

let _registered = false;
export function registerMathRectPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(MathPickerContribution, new DefaultMathRectPicker());
}
