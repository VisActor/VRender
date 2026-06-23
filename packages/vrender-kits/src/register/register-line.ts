import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { registerLineGraphic } from '@visactor/vrender-core/register/graphic';
import { lineModule } from '@visactor/vrender-core/graphic/modules';
import { browser } from './env';
import { bindLineCanvasPickerContribution } from '../picker/contributions/canvas-picker/line-module';
import { bindLineMathPickerContribution } from '../picker/contributions/math-picker/line-module';

function _registerLine() {
  if (_registerLine.__loaded) {
    return;
  }
  _registerLine.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerLineGraphic();
  (lineModule as any)({ bind: legacyContext.bind });
  browser ? bindLineCanvasPickerContribution(legacyContext) : bindLineMathPickerContribution(legacyContext);
}

_registerLine.__loaded = false;

export const registerLine = _registerLine;
