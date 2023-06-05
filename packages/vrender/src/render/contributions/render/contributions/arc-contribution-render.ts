import { IAABBBounds, isArray } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IArc,
  IArcGraphicAttribute,
  IThemeAttribute
} from '../../../../interface';
import { getScaledStroke } from '../../../../common';
import { drawArcPath } from '../arc-render';
import {
  BaseRenderContributionTime,
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution,
  IBaseRenderContribution
} from './base-contribution-render';

export const ArcRenderContribution = Symbol.for('ArcRenderContribution');

export interface IArcRenderContribution extends IBaseRenderContribution {
  drawShape: (
    arc: IArc,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    arcAttribute: Required<IArcGraphicAttribute>,

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
  ) => void;
}

@injectable()
export class DefaultArcRenderContribution implements IArcRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    arc: IArc,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    arcAttribute: Required<IArcGraphicAttribute>,
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
      innerRadius = arcAttribute.innerRadius,
      outerRadius = arcAttribute.outerRadius,
      startAngle = arcAttribute.startAngle,
      endAngle = arcAttribute.endAngle,
      opacity = arcAttribute.opacity,
      outerBorder,
      innerBorder
    } = arc.attribute;
    if (outerBorder) {
      const { distance = arcAttribute.outerBorder.distance } = outerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const deltaAngle = (distance as number) / outerRadius;
      arc.setAttributes({
        outerRadius: outerRadius + d,
        innerRadius: innerRadius - d,
        startAngle: startAngle - deltaAngle,
        endAngle: endAngle + deltaAngle
      } as any);
      context.beginPath();
      drawArcPath(arc, context, x, y, outerRadius + d, innerRadius - d);
      // shadow
      context.setShadowStyle && context.setShadowStyle(arc, arc.attribute, arcAttribute);

      if (strokeCb) {
        strokeCb(context, outerBorder, arcAttribute.outerBorder);
      } else if (sVisible) {
        // 存在stroke
        const lastOpacity = (arcAttribute.outerBorder as any).opacity;
        (arcAttribute.outerBorder as any).opacity = opacity;
        context.setStrokeStyle(arc, outerBorder, x, y, arcAttribute.outerBorder as any);
        (arcAttribute.outerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    if (innerBorder) {
      const { distance = arcAttribute.innerBorder.distance } = innerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const deltaAngle = (distance as number) / outerRadius;
      arc.setAttributes({
        outerRadius: outerRadius - d,
        innerRadius: innerRadius + d,
        startAngle: startAngle + deltaAngle,
        endAngle: endAngle - deltaAngle
      } as any);
      context.beginPath();
      drawArcPath(arc, context, x, y, outerRadius - d, innerRadius + d);
      // arc.setAttributes({ outerRadius: outerRadius, innerRadius: innerRadius });

      // shadow
      context.setShadowStyle && context.setShadowStyle(arc, arc.attribute, arcAttribute);

      if (strokeCb) {
        strokeCb(context, innerBorder, arcAttribute.innerBorder);
      } else if (sVisible) {
        // 存在stroke
        const lastOpacity = (arcAttribute.innerBorder as any).opacity;
        (arcAttribute.innerBorder as any).opacity = opacity;
        context.setStrokeStyle(arc, innerBorder, x, y, arcAttribute.innerBorder as any);
        (arcAttribute.innerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    arc.setAttributes({ outerRadius: outerRadius, innerRadius: innerRadius, startAngle, endAngle } as any);
  }
}

@injectable()
export class DefaultArcBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements IArcRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
}

@injectable()
export class DefaultArcTextureRenderContribution
  extends DefaultBaseTextureRenderContribution
  implements IArcRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
}
