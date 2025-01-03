import { isArray } from '@visactor/vutils';
import { injectable } from '../../../../common/inversify-lite';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IRect,
  IRectGraphicAttribute,
  IThemeAttribute,
  IRectRenderContribution,
  IDrawContext,
  IBorderStyle
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import { defaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { createRectPath } from '../../../../common/shape/rect';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { defaultBaseTextureRenderContribution } from './base-texture-contribution-render';

export class DefaultRectRenderContribution implements IRectRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    rect: IRect,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    rectAttribute: Required<IRectGraphicAttribute>,
    drawContext: IDrawContext,
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
    const { outerBorder, innerBorder } = rect.attribute;
    const doOuterBorder = outerBorder && outerBorder.visible !== false;
    const doInnerBorder = innerBorder && innerBorder.visible !== false;
    if (!(doOuterBorder || doInnerBorder)) {
      return;
    }
    const {
      cornerRadius = rectAttribute.cornerRadius,
      opacity = rectAttribute.opacity,
      x: originX = rectAttribute.x,
      y: originY = rectAttribute.y,
      scaleX = rectAttribute.scaleX,
      scaleY = rectAttribute.scaleY,
      x1,
      y1,
      keepStrokeScale = rectAttribute.keepStrokeScale
    } = rect.attribute;

    let { width, height } = rect.attribute;

    width = (width ?? x1 - x) || 0;
    height = (height ?? y1 - y) || 0;

    const renderBorder = (borderStyle: Partial<IBorderStyle>, key: 'outerBorder' | 'innerBorder') => {
      const doStroke = !!(borderStyle && borderStyle.stroke);

      const sign = key === 'outerBorder' ? -1 : 1;
      const { distance = rectAttribute[key].distance } = borderStyle;
      const d = keepStrokeScale ? (distance as number) : getScaledStroke(context, distance as number, context.dpr);
      const nextX = x + sign * d;
      const nextY = y + sign * d;
      const dw = d * 2;
      if (cornerRadius === 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0))) {
        // 不需要处理圆角
        context.beginPath();
        context.rect(nextX, nextY, width - sign * dw, height - sign * dw);
      } else {
        context.beginPath();

        // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此rect不再使用cache
        createRectPath(context, nextX, nextY, width - sign * dw, height - sign * dw, cornerRadius);
      }

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(rect, rect.attribute, rectAttribute);

      if (strokeCb) {
        strokeCb(context, borderStyle, rectAttribute[key]);
      } else if (doStroke) {
        // 存在stroke
        const lastOpacity = (rectAttribute[key] as any).opacity;
        (rectAttribute[key] as any).opacity = opacity;
        context.setStrokeStyle(
          rect,
          borderStyle,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          rectAttribute[key] as any
        );
        (rectAttribute[key] as any).opacity = lastOpacity;
        context.stroke();
      }
    };

    doOuterBorder && renderBorder(outerBorder, 'outerBorder');
    doInnerBorder && renderBorder(innerBorder, 'innerBorder');
  }
}

@injectable()
export class SplitRectBeforeRenderContribution implements IRectRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    group: IRect,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    groupAttribute: Required<IRectGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    doFillOrStroke?: { doFill: boolean; doStroke: boolean }
  ) {
    const { stroke = groupAttribute.stroke } = group.attribute as any;

    // 数组且存在为false的项目，那就不绘制
    if (Array.isArray(stroke) && stroke.some(s => s === false)) {
      doFillOrStroke.doStroke = false;
    }
  }
}

@injectable()
export class SplitRectAfterRenderContribution implements IRectRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    rect: IRect,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    groupAttribute: Required<IRectGraphicAttribute>,
    drawContext: IDrawContext,
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
    const {
      x1,
      y1,
      x: originX = groupAttribute.x,
      y: originY = groupAttribute.y,
      stroke = groupAttribute.stroke,
      cornerRadius = groupAttribute.cornerRadius
    } = rect.attribute as any;

    let { width, height } = rect.attribute;
    width = (width ?? x1 - originX) || 0;
    height = (height ?? y1 - originY) || 0;

    // 不是数组
    if (!(Array.isArray(stroke) && stroke.some(s => s === false))) {
      return;
    }

    context.setStrokeStyle(rect, rect.attribute, x, y, groupAttribute);

    // 带不同stroke边框
    if (!(cornerRadius === 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0)))) {
      let lastStrokeI = 0;
      let lastStroke: any;
      createRectPath(
        context,
        x,
        y,
        width,
        height,
        cornerRadius,
        new Array(4).fill(0).map((_, i) => (x1: number, y1: number, x2: number, y2: number) => {
          if (stroke[i]) {
            if (!(lastStrokeI === i - 1 && stroke[i] === lastStroke)) {
              context.setStrokeStyle(rect, { ...rect.attribute, stroke: stroke[i] }, x, y, groupAttribute);
              context.beginPath();
              context.moveTo(x1, y1);
              lastStroke = stroke[i];
            }
            lastStrokeI = i;
            context.lineTo(x2, y2);
            context.stroke();
            if (i === 3) {
              context.beginPath();
            }
          }
        })
      );
      context.stroke();
      return;
    }

    // 单独处理每条边界，目前不考虑圆角
    context.beginPath();
    context.moveTo(x, y);
    // top
    if (stroke[0]) {
      context.lineTo(x + width, y);
    } else {
      context.moveTo(x + width, y);
    }
    // right
    if (stroke[1]) {
      context.lineTo(x + width, y + height);
    } else {
      context.moveTo(x + width, y + height);
    }
    // bottom
    if (stroke[2]) {
      context.lineTo(x, y + height);
    } else {
      context.moveTo(x, y + height);
    }
    // left
    if (stroke[3]) {
      // 没有close path是，起点和终点不连续，需要调整y保证不出现缺口
      const adjustY = stroke[0] ? y - context.lineWidth / 2 : y;
      context.lineTo(x, adjustY);
    } else {
      context.moveTo(x, y);
    }

    context.stroke();
  }
}

export const defaultRectRenderContribution = new DefaultRectRenderContribution();
// export const splitRectBeforeRenderContribution = new SplitRectBeforeRenderContribution();
// export const splitRectAfterRenderContribution = new SplitRectAfterRenderContribution();
export const defaultRectTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultRectBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
