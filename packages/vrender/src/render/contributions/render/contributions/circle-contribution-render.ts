import { injectable } from 'inversify';
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
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

@injectable()
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
    const {
      radius = circleAttribute.radius,
      startAngle = circleAttribute.startAngle,
      endAngle = circleAttribute.endAngle,
      opacity = circleAttribute.opacity,
      outerBorder,
      innerBorder
    } = circle.attribute;

    if (outerBorder) {
      const { distance = circleAttribute.outerBorder.distance } = outerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const dw = d;
      context.beginPath();
      context.arc(x, y, radius + dw, startAngle, endAngle);
      context.closePath();

      // shadow
      context.setShadowStyle && context.setShadowStyle(circle, circle.attribute, circleAttribute);

      if (strokeCb) {
        strokeCb(context, outerBorder, circleAttribute.outerBorder);
      } else if (sVisible) {
        // 存在stroke
        const lastOpacity = (circleAttribute.outerBorder as any).opacity;
        (circleAttribute.outerBorder as any).opacity = opacity;
        context.setStrokeStyle(circle, outerBorder, x, y, circleAttribute.outerBorder as any);
        (circleAttribute.outerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    if (innerBorder) {
      const { distance = circleAttribute.innerBorder.distance } = innerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const dw = d;

      context.beginPath();
      context.arc(x, y, radius - dw, startAngle, endAngle);
      context.closePath();

      // shadow
      context.setShadowStyle && context.setShadowStyle(circle, circle.attribute, circleAttribute);

      if (strokeCb) {
        strokeCb(context, innerBorder, circleAttribute.innerBorder);
      } else if (sVisible) {
        // 存在stroke
        const lastOpacity = (circleAttribute.innerBorder as any).opacity;
        (circleAttribute.innerBorder as any).opacity = opacity;
        context.setStrokeStyle(circle, innerBorder, x, y, circleAttribute.innerBorder as any);
        (circleAttribute.innerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }
  }
}

@injectable()
export class DefaultCircleBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements ICircleRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
}

@injectable()
export class DefaultCircleTextureRenderContribution
  extends DefaultBaseTextureRenderContribution
  implements ICircleRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
}
