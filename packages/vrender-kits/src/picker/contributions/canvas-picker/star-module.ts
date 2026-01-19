import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasStarPicker } from '../constants';
import { DefaultCanvasStarPicker } from './star-picker';

let loadStarPick = false;
export function registerCanvasStarPicker() {
  if (loadStarPick) {
    return;
  }
  loadStarPick = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasStarPicker());
}
