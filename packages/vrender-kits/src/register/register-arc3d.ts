import { registerArc3dGraphic, registerDirectionalLight, registerOrthoCamera } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasArc3dPicker } from '../picker/contributions/canvas-picker/arc3d-module';

function _registerArc3d() {
  if (_registerArc3d.__loaded) {
    return;
  }
  _registerArc3d.__loaded = true;
  registerArc3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  // arc3d renderer registered via core; no /* removed container */ usage
  if (browser) {
    registerCanvasArc3dPicker();
  }
}

_registerArc3d.__loaded = false;

export const registerArc3d = _registerArc3d;
