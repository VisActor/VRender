import { container, registerRichtextGraphic, richtextModule } from '@visactor/vrender-core';
import { browser } from './env';
import { richtextCanvasPickModule } from '../picker/contributions/canvas-picker/richtext-module';
import { richTextMathPickModule } from '../picker/contributions/math-picker/richtext-module';

let loaded = false;
export function registerRichtext() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerRichtextGraphic();
  container.load(richtextModule);
  container.load(browser ? richtextCanvasPickModule : richTextMathPickModule);
}
