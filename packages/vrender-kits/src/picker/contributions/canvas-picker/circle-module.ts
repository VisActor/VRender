import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasCirclePicker } from './circle-picker';

let _registeredCircle = false;
export function registerCanvasCirclePicker() {
  if (_registeredCircle) {
    return;
  }
  _registeredCircle = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasCirclePicker());
}
