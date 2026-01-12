import { registerRect3dGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasRect3dPicker } from '../picker/contributions/canvas-picker/rect3d-module';

function _registerRect3d() {
  if (_registerRect3d.__loaded) {
    return;
  }
  _registerRect3d.__loaded = true;
  registerRect3dGraphic();
  // rect3d renderer registered via core; no /* removed container */ usage
  if (browser) {
    registerCanvasRect3dPicker();
  }
}

_registerRect3d.__loaded = false;

export const registerRect3d = _registerRect3d;
