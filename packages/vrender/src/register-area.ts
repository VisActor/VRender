import type { IArea, IAreaGraphicAttribute } from './core';
import { Area, areaModule, container, graphicCreator } from './core';
import { browser } from './isbrowser';
import { areaCanvasPickModule, areaMathPickModule } from './kits';

export function createArea(attributes: IAreaGraphicAttribute): IArea {
  return new Area(attributes);
}

export function registerArea() {
  graphicCreator.RegisterGraphicCreator('area', createArea);
  container.load(areaModule);
  container.load(browser ? areaCanvasPickModule : areaMathPickModule);
}
