import { application } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasPyramid3dPicker } from './pyramid3d-picker';

let _registeredPyramid3d = false;
export function registerCanvasPyramid3dPicker() {
  if (_registeredPyramid3d) {
    return;
  }
  _registeredPyramid3d = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasPyramid3dPicker());
}
