import { application, GraphicRender } from '@visactor/vrender-core';
import { RoughCanvasArcRender } from './rough-arc';
import { RoughCanvasAreaRender } from './rough-area';
import { RoughCanvasCircleRender } from './rough-circle';
import { RoughCanvasLineRender } from './rough-line';
import { RoughCanvasPathRender } from './rough-path';
import { RoughCanvasRectRender } from './rough-rect';
import { RoughCanvasSymbolRender } from './rough-symbol';

let _registered = false;
export function registerRoughCanvasRenders() {
  if (_registered) {
    return;
  }
  _registered = true;
  const renders = [
    new RoughCanvasCircleRender(),
    new RoughCanvasRectRender(),
    new RoughCanvasPathRender(),
    new RoughCanvasSymbolRender(),
    new RoughCanvasLineRender(),
    new RoughCanvasAreaRender(),
    new RoughCanvasArcRender()
  ];
  for (const render of renders) {
    application.contributions.register(GraphicRender, render);
  }
}
