import { ContainerModule } from '@visactor/vrender-core';
import { CanvasArc3dPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasArc3dPicker } from './arc3d-picker';

let loadArc3dPick = false;
export const arc3dCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadArc3dPick) {
    return;
  }
  loadArc3dPick = true;
  // arc3d picker
  bind(CanvasArc3dPicker).to(DefaultCanvasArc3dPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasArc3dPicker);
});
