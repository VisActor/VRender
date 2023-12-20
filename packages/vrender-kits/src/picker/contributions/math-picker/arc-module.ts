import { ContainerModule } from '@visactor/vrender-core';
import { DefaultMathArcPicker } from './arc-picker';
import { MathArcPicker, MathPickerContribution } from '../constants';

let loadArcPick = false;
export const arcMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadArcPick) {
    return;
  }
  loadArcPick = true;
  // arc picker
  bind(MathArcPicker).to(DefaultMathArcPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathArcPicker);
});
