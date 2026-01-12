import { application } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import { DefaultMathImagePicker } from './image-picker';

let _registered = false;
export function registerMathImagePicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(MathPickerContribution, new DefaultMathImagePicker());
}
