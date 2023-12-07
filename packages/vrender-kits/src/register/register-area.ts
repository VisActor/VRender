import { areaModule, container, registerAreaGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { areaCanvasPickModule } from '../picker/contributions/canvas-picker/area-module';
import { areaMathPickModule } from '../picker/contributions/math-picker/area-module';

let loaded = false;
export function registerArea() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerAreaGraphic;
  container.load(areaModule);
  container.load(browser ? areaCanvasPickModule : areaMathPickModule);
}
