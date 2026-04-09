import {
  getLegacyBindingContext,
  pyramid3dModule,
  registerDirectionalLight,
  registerOrthoCamera,
  registerPyramid3dGraphic
} from '@visactor/vrender-core';
import { bindPyramid3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/pyramid3d-module';

function _registerPyramid3d() {
  if (_registerPyramid3d.__loaded) {
    return;
  }
  _registerPyramid3d.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerPyramid3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  (pyramid3dModule as any)({ bind: legacyContext.bind });
  bindPyramid3dCanvasPickerContribution(legacyContext);
}

_registerPyramid3d.__loaded = false;

export const registerPyramid3d = _registerPyramid3d;
