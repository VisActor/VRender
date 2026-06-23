import { ArcRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathArcPicker, MathPickerContribution } from '../constants';
import { DefaultMathArcPicker } from './arc-picker';

let loadArcPick = false;
export function bindArcMathPickerContribution(container: any) {
  if (loadArcPick) {
    return;
  }
  loadArcPick = true;
  container
    .bind(MathArcPicker)
    .toDynamicValue(() => new DefaultMathArcPicker(resolveContainerBinding(container, ArcRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathArcPicker);
}
