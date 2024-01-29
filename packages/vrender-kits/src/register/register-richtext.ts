import { container, registerRichtextGraphic, richtextModule } from '@visactor/vrender-core';
import { browser } from './env';
import { richtextCanvasPickModule } from '../picker/contributions/canvas-picker/richtext-module';
import { richTextMathPickModule } from '../picker/contributions/math-picker/richtext-module';

function _registerRichtext() {
  if (_registerRichtext.__loaded) {
    return;
  }
  _registerRichtext.__loaded = true;
  registerRichtextGraphic();
  container.load(richtextModule);
  container.load(browser ? richtextCanvasPickModule : richTextMathPickModule);
}

_registerRichtext.__loaded = false;

export const registerRichtext = _registerRichtext;
