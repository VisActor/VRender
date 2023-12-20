import { ContainerModule } from '@visactor/vrender-core';
import { DefaultCanvasArcPicker } from './arc-picker';
import { CanvasArcPicker, CanvasPickerContribution } from '../constants';

let loadArcPick = false;
export const arcCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadArcPick) {
    return;
  }
  loadArcPick = true;
  bind(CanvasArcPicker).to(DefaultCanvasArcPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasArcPicker);
});
