import { contributionRegistry } from '@visactor/vrender-core';
import { DefaultMathArcPicker } from './arc-picker';
import { MathPickerContribution } from '../constants';

let _registered = false;
export function registerMathArcPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(MathPickerContribution, new DefaultMathArcPicker());
}
