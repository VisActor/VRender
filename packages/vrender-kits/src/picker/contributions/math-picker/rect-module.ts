import { RectRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathPickerContribution, MathRectPicker } from '../constants';
import { DefaultMathRectPicker } from './rect-picker';

let loadRectPick = false;
export function bindRectMathPickerContribution(container: any) {
  if (loadRectPick) {
    return;
  }
  loadRectPick = true;
  // rect picker
  container
    .bind(MathRectPicker)
    .toDynamicValue(() => new DefaultMathRectPicker(resolveContainerBinding(container, RectRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathRectPicker);
}
