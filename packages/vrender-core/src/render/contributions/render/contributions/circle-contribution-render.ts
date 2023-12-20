import { injectable } from '../../../../common/inversify-lite';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IThemeAttribute,
  ICircleRenderContribution,
  IDrawContext
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import {
  defaultBaseBackgroundRenderContribution,
  defaultBaseTextureRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

export class DefaultCircleRenderContribution implements ICircleRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    circle: ICircle,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    circleAttribute: Required<ICircleGraphicAttribute>,
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
    const { outerBorder, innerBorder } = circle.attribute;
    const doOuterBorder = outerBorder && outerBorder.visible !== false;
    const doInnerBorder = innerBorder && innerBorder.visible !== false;
    if (!(doOuterBorder || doInnerBorder)) {
      return;
    }
    const {
      radius = circleAttribute.radius,
      startAngle = circleAttribute.startAngle,
      endAngle = circleAttribute.endAngle,
      opacity = circleAttribute.opacity,
      x: originX = circleAttribute.x,
      y: originY = circleAttribute.y,
      scaleX = circleAttribute.scaleX,
      scaleY = circleAttribute.scaleY
    } = circle.attribute;

    const doStrokeOuter = !!(outerBorder && outerBorder.stroke);
    const doStrokeInner = !!(innerBorder && innerBorder.stroke);

    if (doOuterBorder) {
      const { distance = circleAttribute.outerBorder.distance } = outerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const dw = d;
      context.beginPath();
      context.arc(x, y, radius + dw, startAngle, endAngle);
      context.closePath();

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(circle, circle.attribute, circleAttribute);

      if (strokeCb) {
        strokeCb(context, outerBorder, circleAttribute.outerBorder);
      } else if (doStrokeOuter) {
        // 存在stroke
        const lastOpacity = (circleAttribute.outerBorder as any).opacity;
        (circleAttribute.outerBorder as any).opacity = opacity;
        context.setStrokeStyle(
          circle,
          outerBorder,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          circleAttribute.outerBorder as any
        );
        (circleAttribute.outerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    if (doInnerBorder) {
      const { distance = circleAttribute.innerBorder.distance } = innerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const dw = d;

      context.beginPath();
      context.arc(x, y, radius - dw, startAngle, endAngle);
      context.closePath();

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(circle, circle.attribute, circleAttribute);

      if (strokeCb) {
        strokeCb(context, innerBorder, circleAttribute.innerBorder);
      } else if (doStrokeInner) {
        // 存在stroke
        const lastOpacity = (circleAttribute.innerBorder as any).opacity;
        (circleAttribute.innerBorder as any).opacity = opacity;
        context.setStrokeStyle(
          circle,
          innerBorder,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          circleAttribute.innerBorder as any
        );
        (circleAttribute.innerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }
  }
}

export const defaultCircleRenderContribution = new DefaultCircleRenderContribution();
export const defaultCircleTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultCircleBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
