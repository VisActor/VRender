import { ContainerModule } from '@visactor/vrender-core';
import { MathPickerContribution, MathRectPicker } from '../constants';
import { DefaultMathRectPicker } from './rect-picker';

let loadRectPick = false;
export const rectMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadRectPick) {
    return;
  }
  loadRectPick = true;
  // rect picker
  bind(MathRectPicker).to(DefaultMathRectPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathRectPicker);
});
