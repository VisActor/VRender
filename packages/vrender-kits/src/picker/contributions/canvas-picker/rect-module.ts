import { ContainerModule } from '@visactor/vrender-core';
import { DefaultCanvasArcPicker } from './arc-picker';
import { CanvasArcPicker, CanvasPickerContribution, CanvasRectPicker } from '../constants';
import { DefaultCanvasRectPicker } from './rect-picker';

let loadRectPick = false;
export const rectCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadRectPick) {
    return;
  }
  loadRectPick = true;
  bind(CanvasRectPicker).to(DefaultCanvasRectPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasRectPicker);
});
