import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution } from '../constants';
import { DefaultCanvasLottiePicker } from './lottie-picker';

let _registeredLottie = false;
export function registerCanvasLottiePicker() {
  if (_registeredLottie) {
    return;
  }
  _registeredLottie = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasLottiePicker());
}
