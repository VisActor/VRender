import { ContainerModule } from '@visactor/vrender-core';
import { MathCirclePicker, MathPickerContribution, MathPolygonPicker } from '../constants';
import { DefaultMathCirclePicker } from './circle-picker';
import { DefaultMathPolygonPicker } from './polygon-picker';

let loadPolygonPick = false;
export const polygonMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadPolygonPick) {
    return;
  }
  loadPolygonPick = true;
  // polygon picker
  bind(MathPolygonPicker).to(DefaultMathPolygonPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathPolygonPicker);
});
