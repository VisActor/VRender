import { ContainerModule } from '@visactor/vrender-core';
import { MathPickerContribution, MathSymbolPicker } from '../constants';
import { DefaultMathSymbolPicker } from './symbol-picker';

let loadSymbolPick = false;
export const symbolMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadSymbolPick) {
    return;
  }
  loadSymbolPick = true;
  // symbol picker
  bind(MathSymbolPicker).to(DefaultMathSymbolPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathSymbolPicker);
});
