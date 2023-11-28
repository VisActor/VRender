import { ContainerModule } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasSymbolPicker } from '../constants';
import { DefaultCanvasSymbolPicker } from './symbol-picker';

let loadSymbolPick = false;
export const symbolCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadSymbolPick) {
    return;
  }
  loadSymbolPick = true;
  // symbol picker
  bind(CanvasSymbolPicker).to(DefaultCanvasSymbolPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasSymbolPicker);
});
