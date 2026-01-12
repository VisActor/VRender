import { application } from '@visactor/vrender-core';
import { CanvasPathPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasPathPicker } from './path-picker';

let loadPathPick = false;
export function registerCanvasPathPicker() {
  if (loadPathPick) {
    return;
  }
  loadPathPick = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasPathPicker());
}
