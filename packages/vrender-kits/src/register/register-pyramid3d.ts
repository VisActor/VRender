import { registerDirectionalLight, registerOrthoCamera, registerPyramid3dGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasPyramid3dPicker } from '../picker/contributions/canvas-picker/pyramid3d-module';

function _registerPyramid3d() {
  if (_registerPyramid3d.__loaded) {
    return;
  }
  _registerPyramid3d.__loaded = true;
  registerPyramid3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  // pyramid3d renderer registered via core; no /* removed container */ usage
  if (browser) {
    registerCanvasPyramid3dPicker();
  }
}

_registerPyramid3d.__loaded = false;

export const registerPyramid3d = _registerPyramid3d;
