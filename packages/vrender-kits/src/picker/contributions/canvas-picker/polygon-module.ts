import { application } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasPolygonPicker } from './polygon-picker';

let _registeredPolygon = false;
export function registerCanvasPolygonPicker() {
  if (_registeredPolygon) {
    return;
  }
  _registeredPolygon = true;
  application.contributions.register(CanvasPickerContribution, new DefaultCanvasPolygonPicker());
}
