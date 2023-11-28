import { ContainerModule } from '@visactor/vrender-core';
import { MathLinePicker, MathPickerContribution } from '../constants';
import { DefaultMathLinePicker } from './line-picker';

let loadLinePick = false;
export const lineMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadLinePick) {
    return;
  }
  loadLinePick = true;
  // line picker
  bind(MathLinePicker).to(DefaultMathLinePicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathLinePicker);
});
