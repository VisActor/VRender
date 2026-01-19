import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasGroupPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGroupPicker } from './group-picker';

let _registered = false;
export function registerCanvasGroupPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasGroupPicker());
}
