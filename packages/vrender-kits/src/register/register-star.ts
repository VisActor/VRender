import { registerStarGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasStarPicker } from '../picker/contributions/canvas-picker/star-module';

function _registerStar() {
  if (_registerStar.__loaded) {
    return;
  }
  _registerStar.__loaded = true;
  registerStarGraphic();
  // star renderer registered via core; no container usage
  registerCanvasStarPicker();
}

_registerStar.__loaded = false;

export const registerStar = _registerStar;
