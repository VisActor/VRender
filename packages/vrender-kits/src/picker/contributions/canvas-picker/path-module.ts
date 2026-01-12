import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPathPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasPathPicker } from './path-picker';

let loadPathPick = false;
export function registerCanvasPathPicker() {
  if (loadPathPick) {
    return;
  }
  loadPathPick = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasPathPicker());
}
