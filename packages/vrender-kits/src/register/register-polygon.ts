import { container, polygonModule, registerPolygonGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { polygonCanvasPickModule } from '../picker/contributions/canvas-picker/polygon-module';
import { polygonMathPickModule } from '../picker/contributions/math-picker/polygon-module';

let loaded = false;
export function registerPolygon() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerPolygonGraphic();
  container.load(polygonModule);
  container.load(browser ? polygonCanvasPickModule : polygonMathPickModule);
}
