import {
  arc3dModule,
  getLegacyBindingContext,
  registerArc3dGraphic,
  registerDirectionalLight,
  registerOrthoCamera
} from '@visactor/vrender-core';
import { bindArc3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/arc3d-module';

function _registerArc3d() {
  if (_registerArc3d.__loaded) {
    return;
  }
  _registerArc3d.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerArc3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  (arc3dModule as any)({ bind: legacyContext.bind });
  bindArc3dCanvasPickerContribution(legacyContext);
}

_registerArc3d.__loaded = false;

export const registerArc3d = _registerArc3d;
