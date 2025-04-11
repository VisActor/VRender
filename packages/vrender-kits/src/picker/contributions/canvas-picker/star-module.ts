import { ContainerModule } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasStarPicker } from '../constants';
import { DefaultCanvasStarPicker } from './star-picker';

let loadStarPick = false;
export const starCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadStarPick) {
    return;
  }
  loadStarPick = true;
  // star picker
  bind(CanvasStarPicker).to(DefaultCanvasStarPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasStarPicker);
});
