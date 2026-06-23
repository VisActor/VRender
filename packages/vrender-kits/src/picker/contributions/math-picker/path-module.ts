import { PathRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathPathPicker, MathPickerContribution } from '../constants';
import { DefaultMathPathPicker } from './path-picker';

let loadPathPick = false;
export function bindPathMathPickerContribution(container: any) {
  if (loadPathPick) {
    return;
  }
  loadPathPick = true;
  container
    .bind(MathPathPicker)
    .toDynamicValue(() => new DefaultMathPathPicker(resolveContainerBinding(container, PathRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathPathPicker);
}
