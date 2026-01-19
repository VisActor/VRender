import {
  contributionRegistry,
  DefaultCanvasArc3DRender,
  GraphicRender,
  registerArc3dGraphic,
  registerDirectionalLight,
  registerOrthoCamera
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasArc3dPicker } from '../picker/contributions/canvas-picker/arc3d-module';

function _registerArc3d() {
  if (_registerArc3d.__loaded) {
    return;
  }
  _registerArc3d.__loaded = true;
  registerArc3dGraphic();
  registerDirectionalLight();
  registerOrthoCamera();
  if (browser) {
    registerCanvasArc3dPicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasArc3DRender());
}

_registerArc3d.__loaded = false;

export const registerArc3d = _registerArc3d;
