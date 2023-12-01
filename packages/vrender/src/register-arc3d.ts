import type { IArc, IArc3dGraphicAttribute } from './core';
import { Arc3d, arc3dModule, container, graphicCreator } from './core';
import { browser } from './isbrowser';
import { arc3dCanvasPickModule } from './kits';

export function createArc3d(attributes: IArc3dGraphicAttribute): IArc {
  return new Arc3d(attributes);
}

export function registerArc3d() {
  graphicCreator.RegisterGraphicCreator('arc3d', createArc3d);
  container.load(arc3dModule);
  container.load(browser ? arc3dCanvasPickModule : arc3dCanvasPickModule);
}
