import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasGifImagePicker } from './gif-image-picker';

let _registeredGifImage = false;
export function registerCanvasGifImagePicker() {
  if (_registeredGifImage) {
    return;
  }
  _registeredGifImage = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasGifImagePicker());
}
