import { CircleRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasCirclePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasCirclePicker } from './circle-picker';

let loadCirclePick = false;
export function bindCircleCanvasPickerContribution(container: any) {
  if (loadCirclePick) {
    return;
  }
  loadCirclePick = true;
  container
    .bind(CanvasCirclePicker)
    .toDynamicValue(() => new DefaultCanvasCirclePicker(resolveContainerBinding(container, CircleRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasCirclePicker);
}
