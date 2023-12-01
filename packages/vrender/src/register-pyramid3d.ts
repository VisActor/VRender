import type { IPyramid3d, IPyramid3dGraphicAttribute } from './core';
import {
  Arc3d,
  IArc,
  IArc3dGraphicAttribute,
  Pyramid3d,
  arc3dModule,
  container,
  graphicCreator,
  pyramid3dModule
} from './core';
import { browser } from './isbrowser';
import { arc3dCanvasPickModule, pyramid3dCanvasPickModule } from './kits';

export function createPyramid3d(attributes: IPyramid3dGraphicAttribute): IPyramid3d {
  return new Pyramid3d(attributes);
}

export function registerPyramid3d() {
  graphicCreator.RegisterGraphicCreator('pyramid3d', createPyramid3d);
  container.load(pyramid3dModule);
  container.load(browser ? pyramid3dCanvasPickModule : pyramid3dCanvasPickModule);
}
