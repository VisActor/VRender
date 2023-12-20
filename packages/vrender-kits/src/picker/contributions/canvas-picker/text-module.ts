import { ContainerModule } from '@visactor/vrender-core';
import { CanvasLinePicker, CanvasPickerContribution, CanvasTextPicker } from '../constants';
import { DefaultCanvasLinePicker } from './line-picker';
import { DefaultCanvasTextPicker } from './text-picker';

let loadTextPick = false;
export const textCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadTextPick) {
    return;
  }
  loadTextPick = true;
  // text picker
  bind(CanvasTextPicker).to(DefaultCanvasTextPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasTextPicker);
});
