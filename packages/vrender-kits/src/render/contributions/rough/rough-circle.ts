import type {
  IGraphicRender,
  IRenderService,
  ICircle,
  IDrawContext,
  IGraphicRenderDrawParams
} from '@visactor/vrender-core';
import { CIRCLE_NUMBER_TYPE, DefaultCanvasCircleRender, getTheme, inject, injectable } from '@visactor/vrender-core';
import rough from 'roughjs';
import { RoughBaseRender } from './base-render';

@injectable()
export class RoughCanvasCircleRender extends RoughBaseRender implements IGraphicRender {
  declare type: 'circle';
  declare numberType: number;
  style: 'rough' = 'rough';

  constructor(
    @inject(DefaultCanvasCircleRender)
    public readonly canvasRenderer: IGraphicRender
  ) {
    super();
    this.type = 'circle';
    this.numberType = CIRCLE_NUMBER_TYPE;
  }

  draw(circle: ICircle, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas, {});

    // const circleAttribute = graphicService.themeService.getCurrentTheme().circleAttribute;
    const circleAttribute = circle.getGraphicTheme();
    let { x = circleAttribute.x, y = circleAttribute.y } = circle.attribute;
    if (!circle.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(circle.transMatrix, true);
    } else if (!context.onlyTranslate()) {
      // 当前context有rotate/scale，重置matrix
      context.clearMatrix();
    }

    const {
      radius = circleAttribute.radius,
      fill = circleAttribute.fill,
      stroke = circleAttribute.stroke,
      lineWidth = circleAttribute.lineWidth
    } = circle.attribute;
    rc.circle(x, y, radius, {
      fill: fill ? (fill as string) : undefined,
      stroke: stroke ? (stroke as string) : undefined,
      strokeWidth: lineWidth,
      fillStyle: 'zigzag',
      roughness: 0.5
    });
  }
}
