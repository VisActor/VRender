import { AreaRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasAreaPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasAreaPicker } from './area-picker';

let loadAreaPick = false;
export function bindAreaCanvasPickerContribution(container: any) {
  if (loadAreaPick) {
    return;
  }
  loadAreaPick = true;
  container
    .bind(CanvasAreaPicker)
    .toDynamicValue(() => new DefaultCanvasAreaPicker(resolveContainerBinding(container, AreaRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasAreaPicker);
}
