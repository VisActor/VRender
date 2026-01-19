import {
  contributionRegistry,
  DefaultCanvasStarRender,
  GraphicRender,
  registerStarGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasStarPicker } from '../picker/contributions/canvas-picker/star-module';

function _registerStar() {
  if (_registerStar.__loaded) {
    return;
  }
  _registerStar.__loaded = true;
  registerStarGraphic();
  registerCanvasStarPicker();

  contributionRegistry.register(GraphicRender, new DefaultCanvasStarRender());
}

_registerStar.__loaded = false;

export const registerStar = _registerStar;
