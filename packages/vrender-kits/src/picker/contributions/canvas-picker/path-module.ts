import { PathRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPathPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasPathPicker } from './path-picker';

let loadPathPick = false;
export function bindPathCanvasPickerContribution(container: any) {
  if (loadPathPick) {
    return;
  }
  loadPathPick = true;
  container
    .bind(CanvasPathPicker)
    .toDynamicValue(() => new DefaultCanvasPathPicker(resolveContainerBinding(container, PathRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasPathPicker);
}
