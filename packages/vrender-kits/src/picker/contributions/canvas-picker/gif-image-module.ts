import { CanvasGifImagePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGifImagePicker } from './gif-image-picker';

let loadGifImagePick = false;
export function bindGifImageCanvasPickerContribution(container: any) {
  if (loadGifImagePick) {
    return;
  }
  loadGifImagePick = true;
  container
    .bind(CanvasGifImagePicker)
    .toDynamicValue(() => new DefaultCanvasGifImagePicker())
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasGifImagePicker);
}
