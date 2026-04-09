import { Rect3DRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasRect3dPicker } from '../constants';
import { DefaultCanvasRect3dPicker } from './rect3d-picker';

let loadRect3dPick = false;
export function bindRect3dCanvasPickerContribution(container: any) {
  if (loadRect3dPick) {
    return;
  }
  loadRect3dPick = true;
  container
    .bind(CanvasRect3dPicker)
    .toDynamicValue(() => new DefaultCanvasRect3dPicker(resolveContainerBinding(container, Rect3DRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasRect3dPicker);
}
