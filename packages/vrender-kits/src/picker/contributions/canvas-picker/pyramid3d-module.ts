import { Pyramid3dRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasPyramid3dPicker } from '../constants';
import { DefaultCanvasPyramid3dPicker } from './pyramid3d-picker';

let loadPyramid3dPick = false;
export function bindPyramid3dCanvasPickerContribution(container: any) {
  if (loadPyramid3dPick) {
    return;
  }
  loadPyramid3dPick = true;
  container
    .bind(CanvasPyramid3dPicker)
    .toDynamicValue(() => new DefaultCanvasPyramid3dPicker(resolveContainerBinding(container, Pyramid3dRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasPyramid3dPicker);
}
