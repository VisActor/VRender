import { container, registerTextGraphic, textModule } from '@visactor/vrender-core';
import { browser } from './env';
import { textCanvasPickModule } from '../picker/contributions/canvas-picker/text-module';
import { textMathPickModule } from '../picker/contributions/math-picker/text-module';

let loaded = false;
export function registerText() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerTextGraphic();
  container.load(textModule);
  container.load(browser ? textCanvasPickModule : textMathPickModule);
}
