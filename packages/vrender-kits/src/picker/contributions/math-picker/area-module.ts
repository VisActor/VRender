import { ContainerModule } from '@visactor/vrender-core';
import { MathAreaPicker, MathLinePicker, MathPickerContribution } from '../constants';
import { DefaultMathLinePicker } from './line-picker';
import { DefaultMathAreaPicker } from './area-picker';

let loadAreaPick = false;
export const areaMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadAreaPick) {
    return;
  }
  loadAreaPick = true;
  // area picker
  bind(MathAreaPicker).to(DefaultMathAreaPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathAreaPicker);
});
