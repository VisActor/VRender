import { application } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathSymbolPicker } from './symbol-picker';

let _registered = false;
export function registerMathSymbolPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(MathPickerContribution, new DefaultMathSymbolPicker());
}
