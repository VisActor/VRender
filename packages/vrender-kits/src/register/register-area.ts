import { areaModule, container, registerAreaGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { areaCanvasPickModule } from '../picker/contributions/canvas-picker/area-module';
import { areaMathPickModule } from '../picker/contributions/math-picker/area-module';

function _registerArea() {
  if (_registerArea.__loaded) {
    return;
  }
  _registerArea.__loaded = true;
  registerAreaGraphic();
  container.load(areaModule);
  container.load(browser ? areaCanvasPickModule : areaMathPickModule);
}

_registerArea.__loaded = false;

export const registerArea = _registerArea;
