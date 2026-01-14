import {
  contributionRegistry,
  DefaultCanvasImageRender,
  GraphicRender,
  registerImageGraphic
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasImagePicker } from '../picker/contributions/canvas-picker/image-module';
import { registerMathImagePicker } from '../picker/contributions/math-picker/image-module';

function _registerImage() {
  if (_registerImage.__loaded) {
    return;
  }
  _registerImage.__loaded = true;
  registerImageGraphic();
  if (browser) {
    registerCanvasImagePicker();
  } else {
    registerMathImagePicker();
  }

  contributionRegistry.register(GraphicRender, new DefaultCanvasImageRender());
}

_registerImage.__loaded = false;

export const registerImage = _registerImage;
