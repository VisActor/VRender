import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IArc,
  IArcGraphicAttribute,
  IThemeAttribute,
  IArcRenderContribution,
  IDrawContext
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import { defaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { drawArcPath } from '../utils';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { defaultBaseTextureRenderContribution } from './base-texture-contribution-render';

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
    const { outerBorder, innerBorder } = arc.attribute;
    const doOuterBorder = outerBorder && outerBorder.visible !== false;
    const doInnerBorder = innerBorder && innerBorder.visible !== false;
    if (!(doOuterBorder || doInnerBorder)) {
      return;
    }
    const {
      innerPadding = arcAttribute.innerPadding,
      outerPadding = arcAttribute.outerPadding,
      startAngle = arcAttribute.startAngle,
      endAngle = arcAttribute.endAngle,
      opacity = arcAttribute.opacity,
      x: originX = arcAttribute.x,
      y: originY = arcAttribute.y,
      scaleX = arcAttribute.scaleX,
      scaleY = arcAttribute.scaleY
    } = arc.attribute;
    let { innerRadius = arcAttribute.innerRadius, outerRadius = arcAttribute.outerRadius } = arc.attribute;
    outerRadius += outerPadding;
    innerRadius -= innerPadding;
    const doStrokeOuter = !!(outerBorder && outerBorder.stroke);
    const doStrokeInner = !!(innerBorder && innerBorder.stroke);

    if (doOuterBorder) {
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
      context.setShadowBlendStyle && context.setShadowBlendStyle(arc, arc.attribute, arcAttribute);

      if (strokeCb) {
        strokeCb(context, outerBorder, arcAttribute.outerBorder);
      } else if (doStrokeOuter) {
        // 存在stroke
        const lastOpacity = (arcAttribute.outerBorder as any).opacity;
        (arcAttribute.outerBorder as any).opacity = opacity;
        context.setStrokeStyle(
          arc,
          outerBorder,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          arcAttribute.outerBorder as any
        );
        (arcAttribute.outerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    if (doInnerBorder) {
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
      context.setShadowBlendStyle && context.setShadowBlendStyle(arc, arc.attribute, arcAttribute);

      if (strokeCb) {
        strokeCb(context, innerBorder, arcAttribute.innerBorder);
      } else if (doStrokeInner) {
        // 存在stroke
        const lastOpacity = (arcAttribute.innerBorder as any).opacity;
        (arcAttribute.innerBorder as any).opacity = opacity;
        context.setStrokeStyle(
          arc,
          innerBorder,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          arcAttribute.innerBorder as any
        );
        (arcAttribute.innerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    arc.setAttributes({ outerRadius: outerRadius, innerRadius: innerRadius, startAngle, endAngle } as any);
  }
}

export const defaultArcRenderContribution = new DefaultArcRenderContribution();
export const defaultArcTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultArcBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
