import { contributionRegistry } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathTextPicker } from './text-picker';

let _registered = false;
export function registerMathTextPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(MathPickerContribution, new DefaultMathTextPicker());
}
