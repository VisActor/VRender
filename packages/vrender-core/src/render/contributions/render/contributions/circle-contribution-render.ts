import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IThemeAttribute,
  ICircleRenderContribution,
  IDrawContext,
  IBorderStyle
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import { defaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { defaultBaseTextureRenderContribution } from './base-texture-contribution-render';

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
      scaleY = circleAttribute.scaleY,
      keepStrokeScale = circleAttribute.keepStrokeScale
    } = circle.attribute;

    const renderBorder = (borderStyle: Partial<IBorderStyle>, key: 'outerBorder' | 'innerBorder') => {
      const doStroke = !!(borderStyle && borderStyle.stroke);

      const { distance = circleAttribute[key].distance } = borderStyle;
      const d = keepStrokeScale ? (distance as number) : getScaledStroke(context, distance as number, context.dpr);
      const sign = key === 'outerBorder' ? 1 : -1;
      context.beginPath();
      context.arc(x, y, radius + sign * d, startAngle, endAngle);
      context.closePath();

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(circle, circle.attribute, circleAttribute);

      if (strokeCb) {
        strokeCb(context, borderStyle, circleAttribute[key]);
      } else if (doStroke) {
        // 存在stroke
        const lastOpacity = (circleAttribute[key] as any).opacity;
        (circleAttribute[key] as any).opacity = opacity;
        context.setStrokeStyle(
          circle,
          borderStyle,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          circleAttribute[key] as any
        );
        (circleAttribute[key] as any).opacity = lastOpacity;
        context.stroke();
      }
    };

    doOuterBorder && renderBorder(outerBorder, 'outerBorder');
    doInnerBorder && renderBorder(innerBorder, 'innerBorder');
  }
}

export const defaultCircleRenderContribution = new DefaultCircleRenderContribution();
export const defaultCircleTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultCircleBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
