import { container, pyramid3dModule, registerPyramid3dGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { pyramid3dCanvasPickModule } from '../picker/contributions/canvas-picker/pyramid3d-module';

let loaded = false;
export function registerPyramid3d() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerPyramid3dGraphic();
  container.load(pyramid3dModule);
  container.load(browser ? pyramid3dCanvasPickModule : pyramid3dCanvasPickModule);
}
