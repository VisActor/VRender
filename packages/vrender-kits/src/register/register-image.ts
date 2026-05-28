import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { registerImageGraphic } from '@visactor/vrender-core/register/graphic';
import { imageModule } from '@visactor/vrender-core/graphic/modules';
import { browser } from './env';
import { bindImageCanvasPickerContribution } from '../picker/contributions/canvas-picker/image-module';
import { bindImageMathPickerContribution } from '../picker/contributions/math-picker/image-module';

function _registerImage() {
  if (_registerImage.__loaded) {
    return;
  }
  _registerImage.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerImageGraphic();
  (imageModule as any)({ bind: legacyContext.bind });
  browser ? bindImageCanvasPickerContribution(legacyContext) : bindImageMathPickerContribution(legacyContext);
}

_registerImage.__loaded = false;

export const registerImage = _registerImage;
