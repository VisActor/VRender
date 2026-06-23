import { LineRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasLinePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasLinePicker } from './line-picker';

let loadLinePick = false;
export function bindLineCanvasPickerContribution(container: any) {
  if (loadLinePick) {
    return;
  }
  loadLinePick = true;
  container
    .bind(CanvasLinePicker)
    .toDynamicValue(() => new DefaultCanvasLinePicker(resolveContainerBinding(container, LineRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasLinePicker);
}
