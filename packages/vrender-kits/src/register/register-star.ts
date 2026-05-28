import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { registerStarGraphic } from '@visactor/vrender-core/register/graphic';
import { starModule } from '@visactor/vrender-core/graphic/modules';
import { bindStarCanvasPickerContribution } from '../picker/contributions/canvas-picker/star-module';

function _registerStar() {
  if (_registerStar.__loaded) {
    return;
  }
  _registerStar.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerStarGraphic();
  (starModule as any)({ bind: legacyContext.bind });
  bindStarCanvasPickerContribution(legacyContext);
}

_registerStar.__loaded = false;

export const registerStar = _registerStar;
