import { application } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasArc3dPicker } from './arc3d-picker';

let _registeredArc3d = false;
export function registerCanvasArc3dPicker() {
  if (_registeredArc3d) {
    return;
  }
  _registeredArc3d = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasArc3dPicker());
}
