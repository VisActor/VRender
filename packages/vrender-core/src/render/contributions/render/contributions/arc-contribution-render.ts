import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IArc,
  IArcGraphicAttribute,
  IThemeAttribute,
  IArcRenderContribution,
  IDrawContext,
  IBorderStyle
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
      scaleY = arcAttribute.scaleY,
      keepStrokeScale = arcAttribute.keepStrokeScale
    } = arc.attribute;
    let { innerRadius = arcAttribute.innerRadius, outerRadius = arcAttribute.outerRadius } = arc.attribute;
    outerRadius += outerPadding;
    innerRadius -= innerPadding;

    const renderBorder = (borderStyle: Partial<IBorderStyle>, key: 'outerBorder' | 'innerBorder') => {
      const doStroke = !!(borderStyle && borderStyle.stroke);

      const { distance = arcAttribute[key].distance } = borderStyle;
      const d = keepStrokeScale ? (distance as number) : getScaledStroke(context, distance as number, context.dpr);
      const deltaAngle = (distance as number) / outerRadius;
      const sign = key === 'outerBorder' ? 1 : -1;
      arc.setAttributes({
        outerRadius: outerRadius + sign * d,
        innerRadius: innerRadius - sign * d,
        startAngle: startAngle - sign * deltaAngle,
        endAngle: endAngle + sign * deltaAngle
      } as any);
      context.beginPath();
      drawArcPath(arc, context, x, y, outerRadius + sign * d, innerRadius - sign * d);
      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(arc, arc.attribute, arcAttribute);

      if (strokeCb) {
        strokeCb(context, borderStyle, arcAttribute[key]);
      } else if (doStroke) {
        // 存在stroke
        const lastOpacity = (arcAttribute[key] as any).opacity;
        (arcAttribute[key] as any).opacity = opacity;
        context.setStrokeStyle(
          arc,
          borderStyle,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          arcAttribute[key] as any
        );
        (arcAttribute[key] as any).opacity = lastOpacity;
        context.stroke();
      }
    };

    doOuterBorder && renderBorder(outerBorder, 'outerBorder');
    doInnerBorder && renderBorder(innerBorder, 'innerBorder');
    arc.setAttributes({ outerRadius: outerRadius, innerRadius: innerRadius, startAngle, endAngle } as any);
  }
}

export const defaultArcRenderContribution = new DefaultArcRenderContribution();
export const defaultArcTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultArcBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
