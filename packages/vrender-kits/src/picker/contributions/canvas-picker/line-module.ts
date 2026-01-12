import { application } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasLinePicker } from './line-picker';

let _registered = false;
export function registerCanvasLinePicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasLinePicker());
}
