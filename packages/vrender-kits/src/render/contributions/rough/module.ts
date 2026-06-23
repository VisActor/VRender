import {
  AreaRenderContribution,
  DefaultCanvasArcRender,
  DefaultCanvasCircleRender,
  DefaultCanvasLineRender,
  DefaultCanvasPathRender,
  DefaultCanvasRectRender,
  DefaultCanvasSymbolRender,
  GraphicRender
} from '@visactor/vrender-core';
import { createContributionProvider, resolveContainerBinding } from '../../../common/explicit-binding';
import { RoughCanvasArcRender } from './rough-arc';
import { RoughCanvasAreaRender } from './rough-area';
import { RoughCanvasCircleRender } from './rough-circle';
import { RoughCanvasLineRender } from './rough-line';
import { RoughCanvasPathRender } from './rough-path';
import { RoughCanvasRectRender } from './rough-rect';
import { RoughCanvasSymbolRender } from './rough-symbol';

export function bindRoughRenderContributions(container: any) {
  // circle
  container
    .bind(RoughCanvasCircleRender)
    .toDynamicValue(() => new RoughCanvasCircleRender(resolveContainerBinding(container, DefaultCanvasCircleRender)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasCircleRender);

  // rect
  container
    .bind(RoughCanvasRectRender)
    .toDynamicValue(() => new RoughCanvasRectRender(resolveContainerBinding(container, DefaultCanvasRectRender)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasRectRender);

  // path
  container
    .bind(RoughCanvasPathRender)
    .toDynamicValue(() => new RoughCanvasPathRender(resolveContainerBinding(container, DefaultCanvasPathRender)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasPathRender);

  // symbol
  container
    .bind(RoughCanvasSymbolRender)
    .toDynamicValue(() => new RoughCanvasSymbolRender(resolveContainerBinding(container, DefaultCanvasSymbolRender)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasSymbolRender);

  // line
  container
    .bind(RoughCanvasLineRender)
    .toDynamicValue(() => new RoughCanvasLineRender(resolveContainerBinding(container, DefaultCanvasLineRender)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasLineRender);

  // area
  container
    .bind(RoughCanvasAreaRender)
    .toDynamicValue(() => new RoughCanvasAreaRender(createContributionProvider(AreaRenderContribution, container)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasAreaRender);

  // area
  container
    .bind(RoughCanvasArcRender)
    .toDynamicValue(() => new RoughCanvasArcRender(resolveContainerBinding(container, DefaultCanvasArcRender)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(RoughCanvasArcRender);
}

export default bindRoughRenderContributions;
