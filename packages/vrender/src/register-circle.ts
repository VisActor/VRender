import type { ICircleGraphicAttribute, ICircle } from './core';
import { Circle, container, graphicCreator, circleModule } from './core';
import { browser } from './isbrowser';
import { circleCanvasPickModule, circleMathPickModule } from './kits';

export function createCircle(attributes: ICircleGraphicAttribute): ICircle {
  return new Circle(attributes);
}

export function registerCircle() {
  graphicCreator.RegisterGraphicCreator('circle', createCircle);
  container.load(circleModule);
  container.load(browser ? circleCanvasPickModule : circleMathPickModule);
}
