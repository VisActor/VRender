import { ImageRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasImagePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasImagePicker } from './image-picker';

let loadImagePick = false;
export function bindImageCanvasPickerContribution(container: any) {
  if (loadImagePick) {
    return;
  }
  loadImagePick = true;
  container
    .bind(CanvasImagePicker)
    .toDynamicValue(() => new DefaultCanvasImagePicker(resolveContainerBinding(container, ImageRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasImagePicker);
}
