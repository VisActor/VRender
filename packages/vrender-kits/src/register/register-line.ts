import { container, lineModule, registerLineGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { lineCanvasPickModule } from '../picker/contributions/canvas-picker/line-module';
import { lineMathPickModule } from '../picker/contributions/math-picker/line-module';

let loaded = false;
export function registerLine() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerLineGraphic();
  container.load(lineModule);
  container.load(browser ? lineCanvasPickModule : lineMathPickModule);
}
