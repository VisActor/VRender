import type { IRect3d, IRect3dGraphicAttribute } from './core';
import { Rect3d, arcModule, container, graphicCreator, rect3dModule } from './core';
import { browser } from './isbrowser';
import { rect3dCanvasPickModule } from './kits';

export function createRect3d(attributes: IRect3dGraphicAttribute): IRect3d {
  return new Rect3d(attributes);
}

export function registerRect3d() {
  graphicCreator.RegisterGraphicCreator('rect3d', createRect3d);
  container.load(rect3dModule);
  container.load(browser ? rect3dCanvasPickModule : rect3dCanvasPickModule);
}
