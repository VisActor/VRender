import { container, rect3dModule, registerRect3dGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { rect3dCanvasPickModule } from '../picker/contributions/canvas-picker/rect3d-module';

let loaded = false;
export function registerRect3d() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerRect3dGraphic();
  container.load(rect3dModule);
  container.load(browser ? rect3dCanvasPickModule : rect3dCanvasPickModule);
}
