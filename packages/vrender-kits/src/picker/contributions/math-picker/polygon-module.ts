import { PolygonRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathPickerContribution, MathPolygonPicker } from '../constants';
import { DefaultMathPolygonPicker } from './polygon-picker';

let loadPolygonPick = false;
export function bindPolygonMathPickerContribution(container: any) {
  if (loadPolygonPick) {
    return;
  }
  loadPolygonPick = true;
  container
    .bind(MathPolygonPicker)
    .toDynamicValue(() => new DefaultMathPolygonPicker(resolveContainerBinding(container, PolygonRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathPolygonPicker);
}
