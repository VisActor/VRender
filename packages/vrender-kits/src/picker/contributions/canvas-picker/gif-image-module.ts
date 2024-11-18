import { ContainerModule } from '@visactor/vrender-core';
import { CanvasGifImagePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGifImagePicker } from './gif-image-picker';

let loadGifImagePick = false;
export const gifImageCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadGifImagePick) {
    return;
  }
  loadGifImagePick = true;
  // gifGifImage picker
  bind(CanvasGifImagePicker).to(DefaultCanvasGifImagePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGifImagePicker);
});
