import { ContainerModule } from '@visactor/vrender-core';
import { CanvasPathPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasPathPicker } from './path-picker';

let loadPathPick = false;
export const pathCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadPathPick) {
    return;
  }
  loadPathPick = true;
  // path picker
  bind(CanvasPathPicker).to(DefaultCanvasPathPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasPathPicker);
});
