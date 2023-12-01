import type { IArc, IArcGraphicAttribute } from './core';
import { Arc, arcModule, container, graphicCreator } from './core';
import { browser } from './isbrowser';
import { arcCanvasPickModule, arcMathPickModule } from './kits';

export function createArc(attributes: IArcGraphicAttribute): IArc {
  return new Arc(attributes);
}

export function registerArc() {
  graphicCreator.RegisterGraphicCreator('arc', createArc);
  container.load(arcModule);
  container.load(browser ? arcCanvasPickModule : arcMathPickModule);
}
