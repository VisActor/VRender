import { ContainerModule } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasPyramid3dPicker } from '../constants';
import { DefaultCanvasPyramid3dPicker } from './pyramid3d-picker';

let loadPyramid3dPick = false;
export const pyramid3dCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadPyramid3dPick) {
    return;
  }
  loadPyramid3dPick = true;
  // pyramid3d picker
  bind(CanvasPyramid3dPicker).to(DefaultCanvasPyramid3dPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasPyramid3dPicker);
});
