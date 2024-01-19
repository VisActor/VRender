import { container, polygonModule, registerPolygonGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { polygonCanvasPickModule } from '../picker/contributions/canvas-picker/polygon-module';
import { polygonMathPickModule } from '../picker/contributions/math-picker/polygon-module';

function _registerPolygon() {
  if (_registerPolygon.__loaded) {
    return;
  }
  _registerPolygon.__loaded = true;
  registerPolygonGraphic();
  container.load(polygonModule);
  container.load(browser ? polygonCanvasPickModule : polygonMathPickModule);
}

_registerPolygon.__loaded = false;

export const registerPolygon = _registerPolygon;
