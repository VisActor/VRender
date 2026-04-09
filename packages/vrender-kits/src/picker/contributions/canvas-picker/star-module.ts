import { StarRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasStarPicker } from '../constants';
import { DefaultCanvasStarPicker } from './star-picker';

let loadStarPick = false;
export function bindStarCanvasPickerContribution(container: any) {
  if (loadStarPick) {
    return;
  }
  loadStarPick = true;
  container
    .bind(CanvasStarPicker)
    .toDynamicValue(() => new DefaultCanvasStarPicker(resolveContainerBinding(container, StarRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasStarPicker);
}
