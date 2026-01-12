import { application } from '@visactor/vrender-core';
import { CanvasImagePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasImagePicker } from './image-picker';

let _registered = false;
export function registerCanvasImagePicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasImagePicker());
}
