import type { ITextGraphicAttribute, IText } from './core';
import { Text, container, graphicCreator, textModule, IRect3dGraphicAttribute, IRect3d, Rect3d } from './core';
import { browser } from './isbrowser';
import { textCanvasPickModule, textMathPickModule } from './kits';

export function createText(attributes: ITextGraphicAttribute): IText {
  return new Text(attributes);
}

export function registerText() {
  graphicCreator.RegisterGraphicCreator('text', createText);
  container.load(textModule);
  container.load(browser ? textCanvasPickModule : textMathPickModule);
}
