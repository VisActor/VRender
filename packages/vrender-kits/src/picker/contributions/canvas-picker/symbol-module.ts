import { SymbolRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasSymbolPicker } from '../constants';
import { DefaultCanvasSymbolPicker } from './symbol-picker';

let loadSymbolPick = false;
export function bindSymbolCanvasPickerContribution(container: any) {
  if (loadSymbolPick) {
    return;
  }
  loadSymbolPick = true;
  container
    .bind(CanvasSymbolPicker)
    .toDynamicValue(() => new DefaultCanvasSymbolPicker(resolveContainerBinding(container, SymbolRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasSymbolPicker);
}
