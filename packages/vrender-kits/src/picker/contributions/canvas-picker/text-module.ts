import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasTextPicker } from '../constants';
import { DefaultCanvasTextPicker } from './text-picker';

let _registeredText = false;
export function registerCanvasTextPicker() {
  if (_registeredText) {
    return;
  }
  _registeredText = true;
  // Register picker implementation in contribution registry
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasTextPicker());
}
