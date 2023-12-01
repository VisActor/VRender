import type { ILine, ILineGraphicAttribute } from './core';
import { Line, container, graphicCreator, lineModule } from './core';
import { browser } from './isbrowser';
import { lineCanvasPickModule, lineMathPickModule } from './kits';

export function createLine(attributes: ILineGraphicAttribute): ILine {
  return new Line(attributes);
}

export function registerLine() {
  graphicCreator.RegisterGraphicCreator('line', createLine);
  container.load(lineModule);
  container.load(browser ? lineCanvasPickModule : lineMathPickModule);
}
