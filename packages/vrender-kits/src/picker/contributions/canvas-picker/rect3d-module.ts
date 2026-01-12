import { application } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasRect3dPicker } from './rect3d-picker';

let _registeredRect3d = false;
export function registerCanvasRect3dPicker() {
  if (_registeredRect3d) {
    return;
  }
  _registeredRect3d = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasRect3dPicker());
}
