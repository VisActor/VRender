import { ContainerModule } from '@visactor/vrender-core';
import { CanvasLinePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasLinePicker } from './line-picker';

let loadLinePick = false;
export const lineCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadLinePick) {
    return;
  }
  loadLinePick = true;
  bind(CanvasLinePicker).to(DefaultCanvasLinePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasLinePicker);
});
