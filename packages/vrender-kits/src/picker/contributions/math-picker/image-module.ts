import { contributionRegistry } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathImagePicker } from './image-picker';

let _registered = false;
export function registerMathImagePicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(MathPickerContribution, new DefaultMathImagePicker());
}
