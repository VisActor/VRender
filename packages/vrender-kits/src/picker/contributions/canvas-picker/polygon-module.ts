import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasPolygonPicker } from './polygon-picker';

let _registeredPolygon = false;
export function registerCanvasPolygonPicker() {
  if (_registeredPolygon) {
    return;
  }
  _registeredPolygon = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasPolygonPicker());
}
