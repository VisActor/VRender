import type { IPathGraphicAttribute, IPath } from './core';
import { container, graphicCreator, Path, pathModule } from './core';
import { browser } from './isbrowser';
import { pathCanvasPickModule, pathMathPickModule } from './kits';

export function createPath(attributes: IPathGraphicAttribute): IPath {
  return new Path(attributes);
}

export function registerPath() {
  graphicCreator.RegisterGraphicCreator('path', createPath);
  container.load(pathModule);
  container.load(browser ? pathCanvasPickModule : pathMathPickModule);
}
