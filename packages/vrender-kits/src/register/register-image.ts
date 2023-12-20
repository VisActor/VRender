import { container, imageModule, registerImageGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { imageCanvasPickModule } from '../picker/contributions/canvas-picker/image-module';
import { imageMathPickModule } from '../picker/contributions/math-picker/image-module';

let loaded = false;
export function registerImage() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerImageGraphic();
  container.load(imageModule);
  container.load(browser ? imageCanvasPickModule : imageMathPickModule);
}
