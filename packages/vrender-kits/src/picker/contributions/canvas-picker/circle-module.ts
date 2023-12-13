import { ContainerModule } from '@visactor/vrender-core';
import { CanvasCirclePicker, CanvasLinePicker, CanvasPickerContribution, CanvasTextPicker } from '../constants';
import { DefaultCanvasLinePicker } from './line-picker';
import { DefaultCanvasTextPicker } from './text-picker';
import { DefaultCanvasCirclePicker } from './circle-picker';

let loadCirclePick = false;
export const circleCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadCirclePick) {
    return;
  }
  loadCirclePick = true;
  // circle picker
  bind(CanvasCirclePicker).to(DefaultCanvasCirclePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasCirclePicker);
});
