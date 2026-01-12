import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasImagePicker } from './image-picker';

let _registered = false;
export function registerCanvasImagePicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasImagePicker());
}
