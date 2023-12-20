import { ContainerModule } from '@visactor/vrender-core';
import { DefaultMathArcPicker } from './arc-picker';
import { MathArcPicker, MathPickerContribution, MathTextPicker } from '../constants';
import { DefaultMathTextPicker } from './text-picker';

let loadTextPick = false;
export const textMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadTextPick) {
    return;
  }
  loadTextPick = true;
  // text picker
  bind(MathTextPicker).to(DefaultMathTextPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathTextPicker);
});
