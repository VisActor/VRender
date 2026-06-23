import { Arc3dRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasArc3dPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasArc3dPicker } from './arc3d-picker';

let loadArc3dPick = false;
export function bindArc3dCanvasPickerContribution(container: any) {
  if (loadArc3dPick) {
    return;
  }
  if (!container.isBound?.(Arc3dRender)) {
    return;
  }
  loadArc3dPick = true;
  container
    .bind(CanvasArc3dPicker)
    .toDynamicValue(() => new DefaultCanvasArc3dPicker(resolveContainerBinding(container, Arc3dRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasArc3dPicker);
}
