import { ContainerModule } from '@visactor/vrender-core';
import { CanvasLottiePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasLottiePicker } from './lottie-picker';

let loadLottiePick = false;
export const lottieCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadLottiePick) {
    return;
  }
  loadLottiePick = true;
  bind(CanvasLottiePicker).to(DefaultCanvasLottiePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasLottiePicker);
});
