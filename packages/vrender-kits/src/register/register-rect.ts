import { container, rectModule, registerRectGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { rectCanvasPickModule } from '../picker/contributions/canvas-picker/rect-module';
import { rectMathPickModule } from '../picker/contributions/math-picker/rect-module';

let loaded = false;
export function registerRect() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerRectGraphic();
  container.load(rectModule);
  container.load(browser ? rectCanvasPickModule : rectMathPickModule);
}
