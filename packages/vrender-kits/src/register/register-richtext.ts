import { registerRichtextGraphic } from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasRichtextPicker } from '../picker/contributions/canvas-picker/richtext-module';
import { registerMathRichTextPicker } from '../picker/contributions/math-picker/richtext-module';

function _registerRichtext() {
  if (_registerRichtext.__loaded) {
    return;
  }
  _registerRichtext.__loaded = true;
  registerRichtextGraphic();
  // richtext renderer registered via core; no container usage
  if (browser) {
    registerCanvasRichtextPicker();
  } else {
    registerMathRichTextPicker();
  }
}

_registerRichtext.__loaded = false;

export const registerRichtext = _registerRichtext;
