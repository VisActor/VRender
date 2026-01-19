import { contributionRegistry } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathPolygonPicker } from './polygon-picker';

let _registered = false;
export function registerMathPolygonPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(MathPickerContribution, new DefaultMathPolygonPicker());
}
