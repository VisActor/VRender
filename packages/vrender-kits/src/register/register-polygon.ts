import { getLegacyBindingContext, polygonModule, registerPolygonGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { bindPolygonCanvasPickerContribution } from '../picker/contributions/canvas-picker/polygon-module';
import { bindPolygonMathPickerContribution } from '../picker/contributions/math-picker/polygon-module';

function _registerPolygon() {
  if (_registerPolygon.__loaded) {
    return;
  }
  _registerPolygon.__loaded = true;
  const legacyContext = getLegacyBindingContext();
  registerPolygonGraphic();
  (polygonModule as any)({ bind: legacyContext.bind });
  browser ? bindPolygonCanvasPickerContribution(legacyContext) : bindPolygonMathPickerContribution(legacyContext);
}

_registerPolygon.__loaded = false;

export const registerPolygon = _registerPolygon;
