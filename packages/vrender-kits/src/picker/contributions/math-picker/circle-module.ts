import { CircleRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathCirclePicker, MathPickerContribution } from '../constants';
import { DefaultMathCirclePicker } from './circle-picker';

let loadCirclePick = false;
export function bindCircleMathPickerContribution(container: any) {
  if (loadCirclePick) {
    return;
  }
  loadCirclePick = true;
  container
    .bind(MathCirclePicker)
    .toDynamicValue(() => new DefaultMathCirclePicker(resolveContainerBinding(container, CircleRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathCirclePicker);
}
