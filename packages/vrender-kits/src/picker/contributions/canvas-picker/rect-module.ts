import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasRectPicker } from './rect-picker';

let _registeredRect = false;
export function registerCanvasRectPicker() {
  if (_registeredRect) {
    return;
  }
  _registeredRect = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasRectPicker());
}
