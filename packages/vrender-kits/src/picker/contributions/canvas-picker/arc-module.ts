import { ArcRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasArcPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasArcPicker } from './arc-picker';

let loadArcPick = false;
export function bindArcCanvasPickerContribution(container: any) {
  if (loadArcPick) {
    return;
  }
  loadArcPick = true;
  container
    .bind(CanvasArcPicker)
    .toDynamicValue(() => new DefaultCanvasArcPicker(resolveContainerBinding(container, ArcRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasArcPicker);
}
