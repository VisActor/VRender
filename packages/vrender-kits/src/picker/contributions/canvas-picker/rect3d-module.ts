import { ContainerModule } from '@visactor/vrender-core';
import { DefaultCanvasArcPicker } from './arc-picker';
import { CanvasArcPicker, CanvasPickerContribution, CanvasRect3dPicker, CanvasRectPicker } from '../constants';
import { DefaultCanvasRectPicker } from './rect-picker';
import { DefaultCanvasRect3dPicker } from './rect3d-picker';

let loadRect3dPick = false;
export const rect3dCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadRect3dPick) {
    return;
  }
  loadRect3dPick = true;
  // reat3d picker
  bind(CanvasRect3dPicker).to(DefaultCanvasRect3dPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasRect3dPicker);
});
