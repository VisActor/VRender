import { application } from '@visactor/vrender-core';
import { CanvasAreaPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasAreaPicker } from './area-picker';

let loadAreaPick = false;
export function registerCanvasAreaPicker() {
  if (loadAreaPick) {
    return;
  }
  loadAreaPick = true;
  // area picker
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasAreaPicker());
}
