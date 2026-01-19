import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasSymbolPicker } from '../constants';
import { DefaultCanvasSymbolPicker } from './symbol-picker';

let loadSymbolPick = false;
export function registerCanvasSymbolPicker() {
  if (loadSymbolPick) {
    return;
  }
  loadSymbolPick = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasSymbolPicker());
}
