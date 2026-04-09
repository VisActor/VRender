import { TextRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasTextPicker } from '../constants';
import { DefaultCanvasTextPicker } from './text-picker';

let loadTextPick = false;
export function bindTextCanvasPickerContribution(container: any) {
  if (loadTextPick) {
    return;
  }
  loadTextPick = true;
  container
    .bind(CanvasTextPicker)
    .toDynamicValue(() => new DefaultCanvasTextPicker(resolveContainerBinding(container, TextRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasTextPicker);
}
