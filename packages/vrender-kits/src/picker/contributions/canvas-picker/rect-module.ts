import { RectRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasRectPicker } from '../constants';
import { DefaultCanvasRectPicker } from './rect-picker';

let loadRectPick = false;
export function bindRectCanvasPickerContribution(container: any) {
  if (loadRectPick) {
    return;
  }
  loadRectPick = true;
  container
    .bind(CanvasRectPicker)
    .toDynamicValue(() => new DefaultCanvasRectPicker(resolveContainerBinding(container, RectRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasRectPicker);
}
