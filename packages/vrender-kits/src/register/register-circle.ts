import { circleModule, container, registerCircleGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { circleCanvasPickModule } from '../picker/contributions/canvas-picker/circle-module';
import { circleMathPickModule } from '../picker/contributions/math-picker/circle-module';

let loaded = false;
export function registerCircle() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerCircleGraphic();
  container.load(circleModule);
  container.load(browser ? circleCanvasPickModule : circleMathPickModule);
}
