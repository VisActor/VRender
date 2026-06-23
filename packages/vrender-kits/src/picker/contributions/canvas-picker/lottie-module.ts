import { RectRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasLottiePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasLottiePicker } from './lottie-picker';

let loadLottiePick = false;
export function bindLottieCanvasPickerContribution(container: any) {
  if (loadLottiePick) {
    return;
  }
  loadLottiePick = true;
  container
    .bind(CanvasLottiePicker)
    .toDynamicValue(() => new DefaultCanvasLottiePicker(resolveContainerBinding(container, RectRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasLottiePicker);
}
