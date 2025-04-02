import { container, starModule, registerStarGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { starCanvasPickModule } from '../picker/contributions/canvas-picker/star-module';

function _registerStar() {
  if (_registerStar.__loaded) {
    return;
  }
  _registerStar.__loaded = true;
  registerStarGraphic();
  container.load(starModule);
  container.load(browser ? starCanvasPickModule : starCanvasPickModule);
}

_registerStar.__loaded = false;

export const registerStar = _registerStar;
