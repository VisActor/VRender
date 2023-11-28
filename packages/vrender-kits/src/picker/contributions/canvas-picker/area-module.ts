import { ContainerModule } from '@visactor/vrender-core';
import { CanvasAreaPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasAreaPicker } from './area-picker';

let loadAreaPick = false;
export const areaCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadAreaPick) {
    return;
  }
  loadAreaPick = true;
  // area picker
  bind(CanvasAreaPicker).to(DefaultCanvasAreaPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasAreaPicker);
});
