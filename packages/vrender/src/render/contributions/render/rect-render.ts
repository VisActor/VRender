import { isArray } from '@visactor/vutils';
import { inject, injectable, named } from 'inversify';
import { getTheme } from '../../../graphic/theme';
import { RECT_NUMBER_TYPE } from '../../../graphic/constants';
import { createRectPath } from '../../../common/shape/rect';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IRect,
  IThemeAttribute,
  IGraphicRender,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService,
  IRectRenderContribution,
  IContributionProvider
} from '../../../interface';
import { RectRenderContribution } from './contributions/constants';
import { drawPathProxy, rectFillVisible, rectStrokeVisible, runFill, runStroke } from './utils';
import { BaseRenderContributionTime } from '../../../common/enums';

@injectable()
export class DefaultCanvasRectRender implements IGraphicRender {
  type = 'rect';
  numberType: number = RECT_NUMBER_TYPE;

  protected _rectRenderContribitions: IRectRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(RectRenderContribution)
    protected readonly rectRenderContribitions: IContributionProvider<IRectRenderContribution>
  ) {}

  drawShape(
    rect: IRect,
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
    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const rectAttribute = getTheme(rect, params?.theme).rect;
    const {
      fill = rectAttribute.fill,
      background,
      stroke = rectAttribute.stroke,
      width = rectAttribute.width,
      height = rectAttribute.height,
      cornerRadius = rectAttribute.cornerRadius,
      opacity = rectAttribute.opacity,
      fillOpacity = rectAttribute.fillOpacity,
      lineWidth = rectAttribute.lineWidth,
      strokeOpacity = rectAttribute.strokeOpacity,
      visible = rectAttribute.visible,
      x: originX = rectAttribute.x,
      y: originY = rectAttribute.y
    } = rect.attribute;

    // 不绘制或者透明
    const fVisible = rectFillVisible(opacity, fillOpacity, width, height);
    const sVisible = rectStrokeVisible(opacity, strokeOpacity, width, height);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(rect.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke || background)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
      return;
    }

    if (cornerRadius === 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0))) {
      // 不需要处理圆角
      context.beginPath();
      context.rect(x, y, width, height);
    } else {
      context.beginPath();

      // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此rect不再使用cache
      createRectPath(context, x, y, width, height, cornerRadius);
    }

    if (!this._rectRenderContribitions) {
      this._rectRenderContribitions = this.rectRenderContribitions.getContributions() || [];
      this._rectRenderContribitions.sort((a, b) => b.order - a.order);
    }

    const doFillOrStroke = {
      doFill,
      doStroke
    };

    this._rectRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
        c.drawShape(
          rect,
          context,
          x,
          y,
          doFill,
          doStroke,
          fVisible,
          sVisible,
          rectAttribute,
          drawContext,
          fillCb,
          strokeCb,
          doFillOrStroke
        );
      }
    });

    // shadow
    context.setShadowStyle && context.setShadowStyle(rect, rect.attribute, rectAttribute);

    if (doFillOrStroke.doFill) {
      if (fillCb) {
        fillCb(context, rect.attribute, rectAttribute);
      } else if (fVisible) {
        // 存在fill
        context.setCommonStyle(rect, rect.attribute, originX - x, originY - y, rectAttribute);
        context.fill();
      }
    }
    if (doFillOrStroke.doStroke) {
      if (strokeCb) {
        strokeCb(context, rect.attribute, rectAttribute);
      } else if (sVisible) {
        // 存在stroke
        context.setStrokeStyle(rect, rect.attribute, originX - x, originY - y, rectAttribute);
        context.stroke();
      }
    }

    this._rectRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        // c.useStyle && context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
        c.drawShape(
          rect,
          context,
          x,
          y,
          doFill,
          doStroke,
          fVisible,
          sVisible,
          rectAttribute,
          drawContext,
          fillCb,
          strokeCb
        );
      }
    });
  }

  draw(rect: IRect, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const rectAttribute = getTheme(rect, params?.theme).rect;
    let { x = rectAttribute.x, y = rectAttribute.y } = rect.attribute;

    if (!rect.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(rect.transMatrix, true);
    } else {
      const point = rect.getOffsetXY(rectAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    if (drawPathProxy(rect, context, x, y, drawContext, params)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(rect, context, x, y, drawContext, params);

    context.highPerformanceRestore();
  }
}
