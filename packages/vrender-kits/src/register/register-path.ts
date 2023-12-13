import { container, pathModule, registerPathGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { pathCanvasPickModule } from '../picker/contributions/canvas-picker/path-module';
import { pathMathPickModule } from '../picker/contributions/math-picker/path-module';

let loaded = false;
export function registerPath() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerPathGraphic();
  container.load(pathModule);
  container.load(browser ? pathCanvasPickModule : pathMathPickModule);
}
