import { inject, injectable } from 'inversify';
import type {
  IGraphicRender,
  IRenderService,
  IGraphic,
  ICircle,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicAttribute,
  IDrawContext,
  IGraphicRenderDrawParams
} from '@visactor/vrender';
import { CIRCLE_NUMBER_TYPE, DefaultCanvasCircleRender, getTheme } from '@visactor/vrender';
import rough from 'roughjs';

@injectable()
export class RoughCanvasCircleRender implements IGraphicRender {
  declare type: 'circle';
  declare numberType: number;
  style: 'rough' = 'rough';

  constructor(
    @inject(DefaultCanvasCircleRender)
    public readonly canvasRenderer: IGraphicRender
  ) {
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
    const circleAttribute = getTheme(circle).circle;
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
      fillColor = circleAttribute.fillColor,
      strokeColor = circleAttribute.strokeColor,
      radius = circleAttribute.radius,
      fill = circleAttribute.fill,
      stroke = circleAttribute.stroke,
      lineWidth = circleAttribute.lineWidth
    } = circle.attribute;
    rc.circle(x, y, radius, {
      fill: fill ? (fillColor as string) : undefined,
      stroke: stroke ? (strokeColor as string) : undefined,
      strokeWidth: lineWidth,
      fillStyle: 'zigzag',
      roughness: 0.5
    });
  }
  drawShape(
    graphic: IGraphic,
    ctx: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ): void {
    if (this.canvasRenderer.drawShape) {
      return this.canvasRenderer.drawShape(graphic, ctx, x, y, drawContext, params, fillCb, strokeCb);
    }
  }
}
