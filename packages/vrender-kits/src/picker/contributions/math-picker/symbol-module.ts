import { contributionRegistry } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathSymbolPicker } from './symbol-picker';

let _registered = false;
export function registerMathSymbolPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(MathPickerContribution, new DefaultMathSymbolPicker());
}
