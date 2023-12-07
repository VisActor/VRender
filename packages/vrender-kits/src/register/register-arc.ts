import { arcModule, container, registerArcGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { arcCanvasPickModule } from '../picker/contributions/canvas-picker/arc-module';
import { arcMathPickModule } from '../picker/contributions/math-picker/arc-module';

let loaded = false;
export function registerArc() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerArcGraphic();
  container.load(arcModule);
  container.load(browser ? arcCanvasPickModule : arcMathPickModule);
}
