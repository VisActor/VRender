import { isArray } from '@visactor/vutils';
import { inject, injectable, named } from '../../../common/inversify-lite';
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
  IContributionProvider,
  IRectGraphicAttribute
} from '../../../interface';
import { RectRenderContribution } from './contributions/constants';
import { rectFillVisible, rectStrokeVisible, runFill, runStroke } from './utils';
import { BaseRender } from './base-render';
import {
  defaultRectBackgroundRenderContribution,
  defaultRectRenderContribution,
  defaultRectTextureRenderContribution
} from './contributions';

@injectable()
export class DefaultCanvasRectRender extends BaseRender<IRect> implements IGraphicRender {
  type = 'rect';
  numberType: number = RECT_NUMBER_TYPE;
  tempTheme: Required<IRectGraphicAttribute>;

  constructor(
    @inject(ContributionProvider)
    @named(RectRenderContribution)
    protected readonly rectRenderContribitions: IContributionProvider<IRectRenderContribution>
  ) {
    super();
    this.builtinContributions = [
      defaultRectRenderContribution,
      defaultRectBackgroundRenderContribution,
      defaultRectTextureRenderContribution
    ];
    this.init(rectRenderContribitions);
  }

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
    const rectAttribute = this.tempTheme ?? getTheme(rect, params?.theme).rect;
    const {
      fill = rectAttribute.fill,
      background,
      stroke = rectAttribute.stroke,
      cornerRadius = rectAttribute.cornerRadius,
      opacity = rectAttribute.opacity,
      fillOpacity = rectAttribute.fillOpacity,
      lineWidth = rectAttribute.lineWidth,
      strokeOpacity = rectAttribute.strokeOpacity,
      visible = rectAttribute.visible,
      x1,
      y1,
      x: originX = rectAttribute.x,
      y: originY = rectAttribute.y,
      fillStrokeOrder = rectAttribute.fillStrokeOrder
    } = rect.attribute;
    let { width, height } = rect.attribute;
    width = (width ?? x1 - originX) || 0;
    height = (height ?? y1 - originY) || 0;

    // 不绘制或者透明
    const fVisible = rectFillVisible(opacity, fillOpacity, width, height, fill);
    const sVisible = rectStrokeVisible(opacity, strokeOpacity, width, height);
    const doFill = runFill(fill, background);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(rect.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke)) {
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

    const doFillOrStroke = {
      doFill,
      doStroke
    };

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(rect, rect.attribute, rectAttribute);

    this.beforeRenderStep(
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

    const _runFill = () => {
      if (doFillOrStroke.doFill) {
        if (fillCb) {
          fillCb(context, rect.attribute, rectAttribute);
        } else if (fVisible) {
          // 存在fill
          context.setCommonStyle(rect, rect.attribute, originX - x, originY - y, rectAttribute);
          context.fill();
        }
      }
    };
    const _runStroke = () => {
      if (doFillOrStroke.doStroke) {
        if (strokeCb) {
          strokeCb(context, rect.attribute, rectAttribute);
        } else if (sVisible) {
          // 存在stroke
          context.setStrokeStyle(rect, rect.attribute, originX - x, originY - y, rectAttribute);
          context.stroke();
        }
      }
    };

    if (!fillStrokeOrder) {
      _runFill();
      _runStroke();
    } else {
      _runStroke();
      _runFill();
    }

    this.afterRenderStep(
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

  draw(rect: IRect, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const rectAttribute = getTheme(rect, params?.theme).rect;
    this.tempTheme = rectAttribute;
    this._draw(rect, rectAttribute, false, drawContext, params);
    this.tempTheme = null;
  }
}
