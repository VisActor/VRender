import { application } from '@visactor/vrender-core';
import { DefaultCanvasArcPicker } from './arc-picker';
import { CanvasPickerContribution } from '../constants';

let _registered = false;
export function registerCanvasArcPicker() {
  if (_registered) {
    return;
  }
  _registered = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasArcPicker());
}
