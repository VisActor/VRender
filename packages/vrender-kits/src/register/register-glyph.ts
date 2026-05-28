import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { registerGlyphGraphic } from '@visactor/vrender-core/register/graphic';
import { glyphModule } from '@visactor/vrender-core/graphic/modules';
import { browser } from './env';
import { bindGlyphCanvasPickerContribution } from '../picker/contributions/canvas-picker/glyph-module';
import { bindGlyphMathPickerContribution } from '../picker/contributions/math-picker/glyph-module';

function _registerGlyph() {
  if (_registerGlyph.__loaded) {
    return;
  }
  _registerGlyph.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerGlyphGraphic();
  (glyphModule as any)({ bind: legacyContext.bind });
  browser ? bindGlyphCanvasPickerContribution(legacyContext) : bindGlyphMathPickerContribution(legacyContext);
}

_registerGlyph.__loaded = false;

export const registerGlyph = _registerGlyph;
