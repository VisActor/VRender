import { ContainerModule } from '@visactor/vrender-core';
import { MathCirclePicker, MathPickerContribution } from '../constants';
import { DefaultMathCirclePicker } from './circle-picker';

let loadCirclePick = false;
export const circleMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadCirclePick) {
    return;
  }
  loadCirclePick = true;
  // circle picker
  bind(MathCirclePicker).to(DefaultMathCirclePicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathCirclePicker);
});
