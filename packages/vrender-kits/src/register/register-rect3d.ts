import {
  contributionRegistry,
  DefaultCanvasRect3dRender,
  GraphicRender,
  registerRect3dGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasRect3dPicker } from '../picker/contributions/canvas-picker/rect3d-module';

function _registerRect3d() {
  if (_registerRect3d.__loaded) {
    return;
  }
  _registerRect3d.__loaded = true;
  registerRect3dGraphic();
  if (browser) {
    registerCanvasRect3dPicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasRect3dRender());
}

_registerRect3d.__loaded = false;

export const registerRect3d = _registerRect3d;
