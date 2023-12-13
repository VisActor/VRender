import { ContainerModule } from '@visactor/vrender-core';
import { MathCirclePicker, MathPathPicker, MathPickerContribution, MathPolygonPicker } from '../constants';
import { DefaultMathCirclePicker } from './circle-picker';
import { DefaultMathPolygonPicker } from './polygon-picker';
import { DefaultMathPathPicker } from './path-picker';

let loadPathPick = false;
export const pathMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadPathPick) {
    return;
  }
  loadPathPick = true;
  // path picker
  bind(MathPathPicker).to(DefaultMathPathPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathPathPicker);
});
