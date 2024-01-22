import { container, rect3dModule, registerRect3dGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { rect3dCanvasPickModule } from '../picker/contributions/canvas-picker/rect3d-module';

function _registerRect3d() {
  if (_registerRect3d.__loaded) {
    return;
  }
  _registerRect3d.__loaded = true;
  registerRect3dGraphic();
  container.load(rect3dModule);
  container.load(browser ? rect3dCanvasPickModule : rect3dCanvasPickModule);
}

_registerRect3d.__loaded = false;

export const registerRect3d = _registerRect3d;
