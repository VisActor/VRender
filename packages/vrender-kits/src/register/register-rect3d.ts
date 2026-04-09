import { getLegacyBindingContext, rect3dModule, registerRect3dGraphic } from '@visactor/vrender-core';
import { bindRect3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/rect3d-module';

function _registerRect3d() {
  if (_registerRect3d.__loaded) {
    return;
  }
  _registerRect3d.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerRect3dGraphic();
  (rect3dModule as any)({ bind: legacyContext.bind });
  bindRect3dCanvasPickerContribution(legacyContext);
}

_registerRect3d.__loaded = false;

export const registerRect3d = _registerRect3d;
