import { AreaRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathAreaPicker, MathPickerContribution } from '../constants';
import { DefaultMathAreaPicker } from './area-picker';

let loadAreaPick = false;
export function bindAreaMathPickerContribution(container: any) {
  if (loadAreaPick) {
    return;
  }
  loadAreaPick = true;
  container
    .bind(MathAreaPicker)
    .toDynamicValue(() => new DefaultMathAreaPicker(resolveContainerBinding(container, AreaRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathAreaPicker);
}
