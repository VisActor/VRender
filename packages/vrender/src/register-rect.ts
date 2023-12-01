import type { IRect, IRectGraphicAttribute } from './core';
import { Rect, container, graphicCreator, isBrowserEnv, rectModule } from './core';
import { browser } from './isbrowser';
import { rectCanvasPickModule, rectMathPickModule } from './kits';

export function createRect(attributes: IRectGraphicAttribute): IRect {
  return new Rect(attributes);
}

export function registerRect() {
  graphicCreator.RegisterGraphicCreator('rect', createRect);
  container.load(rectModule);
  container.load(browser ? rectCanvasPickModule : rectMathPickModule);
}
