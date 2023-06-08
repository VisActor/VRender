import { inject, injectable, named } from 'inversify';
import type { IGraphicAttribute, ICircle, IContext2d, IMarkAttribute, IThemeAttribute } from '../../../interface';
import { CIRCLE_NUMBER_TYPE } from '../../../graphic/circle';
import { getTheme } from '../../../graphic/theme';
import type { IDrawContext, IRenderService } from '../../render-service';
import type { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import type { ICircleRenderContribution } from './contributions/circle-contribution-render';
import { CircleRenderContribution } from './contributions/circle-contribution-render';
import type { ContributionProvider } from '../../../common/contribution-provider';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { BaseRenderContributionTime } from './contributions/base-contribution-render';

@injectable()
export class DefaultCanvasCircleRender implements IGraphicRender {
  type: 'circle';
  numberType: number = CIRCLE_NUMBER_TYPE;

  protected _circleRenderContribitions: ICircleRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(CircleRenderContribution)
    protected readonly circleRenderContribitions: ContributionProvider<ICircleRenderContribution>
  ) {}

  drawShape(
    circle: ICircle,
    context: IContext2d,
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
  ) {
    // const circleAttribute = graphicService.themeService.getCurrentTheme().circleAttribute;
    const circleAttribute = getTheme(circle, params?.theme).circle;
    const {
      fill = circleAttribute.fill,
      background,
      stroke = circleAttribute.stroke,
      radius = circleAttribute.radius,
      startAngle = circleAttribute.startAngle,
      endAngle = circleAttribute.endAngle,
      fillOpacity = circleAttribute.fillOpacity,
      strokeOpacity = circleAttribute.strokeOpacity,
      opacity = circleAttribute.opacity,
      lineWidth = circleAttribute.lineWidth,
      visible = circleAttribute.visible
    } = circle.attribute;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(circle.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke || background)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
      return;
    }

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle);
    context.closePath();

    if (!this._circleRenderContribitions) {
      this._circleRenderContribitions = this.circleRenderContribitions.getContributions() || [];
      this._circleRenderContribitions.sort((a, b) => b.order - a.order);
    }

    this._circleRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(circle, circle.attribute, x, y, circleAttribute);
        c.drawShape(circle, context, x, y, doFill, doStroke, fVisible, sVisible, circleAttribute, fillCb, strokeCb);
      }
    });

    // shadow
    context.setShadowStyle && context.setShadowStyle(circle, circle.attribute, circleAttribute);

    if (doFill) {
      if (fillCb) {
        fillCb(context, circle.attribute, circleAttribute);
      } else if (fVisible) {
        context.setCommonStyle(circle, circle.attribute, x, y, circleAttribute);
        context.fill();
      }
    }

    if (doStroke) {
      if (strokeCb) {
        strokeCb(context, circle.attribute, circleAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(circle, circle.attribute, x, y, circleAttribute);
        context.stroke();
      }
    }

    this._circleRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        // c.useStyle && context.setCommonStyle(circle, circle.attribute, x, y, circleAttribute);
        c.drawShape(circle, context, x, y, doFill, doStroke, fVisible, sVisible, circleAttribute, fillCb, strokeCb);
      }
    });
  }

  draw(circle: ICircle, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    // const circleAttribute = graphicService.themeService.getCurrentTheme().circleAttribute;
    const circleAttribute = getTheme(circle, params?.theme).circle;
    let { x = circleAttribute.x, y = circleAttribute.y } = circle.attribute;
    if (!circle.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(circle.transMatrix, true);
    } else {
      const point = circle.getOffsetXY(circleAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    if (drawPathProxy(circle, context, x, y, drawContext, params)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(circle, context, x, y, drawContext, params);

    context.highPerformanceRestore();
  }
}
