import {
  arc3dModule,
  container,
  registerArc3dGraphic,
  registerDirectionalLight,
  registerOrthoCamera
} from '@visactor/vrender-core';
import { browser } from './env';
import { arc3dCanvasPickModule } from '../picker/contributions/canvas-picker/arc3d-module';

function _registerArc3d() {
  if (_registerArc3d.__loaded) {
    return;
  }
  _registerArc3d.__loaded = true;
  registerArc3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  container.load(arc3dModule);
  container.load(browser ? arc3dCanvasPickModule : arc3dCanvasPickModule);
}

_registerArc3d.__loaded = false;

export const registerArc3d = _registerArc3d;
