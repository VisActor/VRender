import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { registerPyramid3dGraphic } from '@visactor/vrender-core/register/graphic';
import { pyramid3dModule } from '@visactor/vrender-core/graphic/modules';
import { registerDirectionalLight, registerOrthoCamera } from '@visactor/vrender-core/plugin/3d';
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
