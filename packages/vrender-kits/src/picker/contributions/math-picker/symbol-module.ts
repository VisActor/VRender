import { SymbolRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathPickerContribution, MathSymbolPicker } from '../constants';
import { DefaultMathSymbolPicker } from './symbol-picker';

let loadSymbolPick = false;
export function bindSymbolMathPickerContribution(container: any) {
  if (loadSymbolPick) {
    return;
  }
  loadSymbolPick = true;
  container
    .bind(MathSymbolPicker)
    .toDynamicValue(() => new DefaultMathSymbolPicker(resolveContainerBinding(container, SymbolRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathSymbolPicker);
}
