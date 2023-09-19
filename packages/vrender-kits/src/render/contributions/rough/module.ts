import { ContainerModule, GraphicRender } from '@visactor/vrender-core';
import { RoughCanvasArcRender } from './rough-arc';
import { RoughCanvasAreaRender } from './rough-area';
import { RoughCanvasCircleRender } from './rough-circle';
import { RoughCanvasLineRender } from './rough-line';
import { RoughCanvasPathRender } from './rough-path';
import { RoughCanvasRectRender } from './rough-rect';
import { RoughCanvasSymbolRender } from './rough-symbol';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
  // circle
  bind(RoughCanvasCircleRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasCircleRender);

  // rect
  bind(RoughCanvasRectRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasRectRender);

  // path
  bind(RoughCanvasPathRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasPathRender);

  // symbol
  bind(RoughCanvasSymbolRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasSymbolRender);

  // line
  bind(RoughCanvasLineRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasLineRender);

  // area
  bind(RoughCanvasAreaRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasAreaRender);

  // area
  bind(RoughCanvasArcRender).toSelf().inSingletonScope();
  bind(GraphicRender).to(RoughCanvasArcRender);
});
