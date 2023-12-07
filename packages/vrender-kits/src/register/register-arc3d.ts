import { arc3dModule, container, registerArc3dGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { arc3dCanvasPickModule } from '../picker/contributions/canvas-picker/arc3d-module';

let loaded = false;
export function registerArc3d() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerArc3dGraphic();
  container.load(arc3dModule);
  container.load(browser ? arc3dCanvasPickModule : arc3dCanvasPickModule);
}
