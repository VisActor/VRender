import type { IPolygonGraphicAttribute, IPolygon } from './core';
import { container, graphicCreator, polygonModule, Polygon } from './core';
import { browser } from './isbrowser';
import { polygonCanvasPickModule, polygonMathPickModule } from './kits';

export function createPolygon(attributes: IPolygonGraphicAttribute): IPolygon {
  return new Polygon(attributes);
}

export function registerPolygon() {
  graphicCreator.RegisterGraphicCreator('polygon', createPolygon);
  container.load(polygonModule);
  container.load(browser ? polygonCanvasPickModule : polygonMathPickModule);
}
