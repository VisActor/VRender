import { LineRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathLinePicker, MathPickerContribution } from '../constants';
import { DefaultMathLinePicker } from './line-picker';

let loadLinePick = false;
export function bindLineMathPickerContribution(container: any) {
  if (loadLinePick) {
    return;
  }
  loadLinePick = true;
  container
    .bind(MathLinePicker)
    .toDynamicValue(() => new DefaultMathLinePicker(resolveContainerBinding(container, LineRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathLinePicker);
}
