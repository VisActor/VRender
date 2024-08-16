import {
  container,
  pyramid3dModule,
  registerDirectionalLight,
  registerOrthoCamera,
  registerPyramid3dGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { pyramid3dCanvasPickModule } from '../picker/contributions/canvas-picker/pyramid3d-module';

function _registerPyramid3d() {
  if (_registerPyramid3d.__loaded) {
    return;
  }
  _registerPyramid3d.__loaded = true;
  registerPyramid3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  container.load(pyramid3dModule);
  container.load(browser ? pyramid3dCanvasPickModule : pyramid3dCanvasPickModule);
}

_registerPyramid3d.__loaded = false;

export const registerPyramid3d = _registerPyramid3d;
