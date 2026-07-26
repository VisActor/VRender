import { isArray } from '@visactor/vutils';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IPolygon,
  IPolygonGraphicAttribute,
  IThemeAttribute,
  IPolygonRenderContribution,
  IDrawContext,
  IBorderStyle
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import {
  drawPolygon,
  drawRoundedPolygon,
  getPolygonWinding,
  normalizePolygonPoints,
  offsetPolygonPoints
} from '../../../../common/polygon';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { defaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { defaultBaseTextureRenderContribution } from './base-texture-contribution-render';

export const defaultPolygonTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultPolygonBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;

export class DefaultPolygonRenderContribution implements IPolygonRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    polygon: IPolygon,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    polygonAttribute: Required<IPolygonGraphicAttribute>,
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
    const { outerBorder, innerBorder } = polygon.attribute;
    const doOuterBorder = outerBorder && outerBorder.visible !== false;
    const doInnerBorder = innerBorder && innerBorder.visible !== false;
    if (!(doOuterBorder || doInnerBorder)) {
      return;
    }
    const {
      points = polygonAttribute.points,
      cornerRadius = polygonAttribute.cornerRadius,
      opacity = polygonAttribute.opacity,
      x: originX = polygonAttribute.x,
      y: originY = polygonAttribute.y,
      scaleX = polygonAttribute.scaleX,
      scaleY = polygonAttribute.scaleY,
      keepStrokeScale = polygonAttribute.keepStrokeScale,
      closePath = polygonAttribute.closePath
    } = polygon.attribute;

    const renderBorder = (borderStyle: Partial<IBorderStyle>, key: 'outerBorder' | 'innerBorder') => {
      const doBorderStroke = !!borderStyle.stroke;

      const distanceDirection = key === 'outerBorder' ? 1 : -1;
      const { distance = polygonAttribute[key].distance } = borderStyle;
      const borderDistance =
        distanceDirection *
        (keepStrokeScale ? (distance as number) : getScaledStroke(context, distance as number, context.dpr));
      const normalized = normalizePolygonPoints(points, cornerRadius, closePath);
      const normalizedPoints = normalized?.points ?? points;
      const normalizedCornerRadius = normalized?.cornerRadius ?? cornerRadius;
      const borderPoints = offsetPolygonPoints(normalizedPoints, borderDistance, closePath);

      const winding = getPolygonWinding(normalizedPoints);
      // 凸角外扩时半径增大，凹角则减小；内缩时关系相反。
      const borderCornerRadius = normalizedPoints.map((point, i) => {
        const radius = isArray(normalizedCornerRadius)
          ? (<number[]>normalizedCornerRadius)[i] ?? 0
          : (normalizedCornerRadius as number) || 0;
        if ((!closePath && (i === 0 || i === normalizedPoints.length - 1)) || normalizedPoints.length < 3) {
          return radius;
        }
        const prev = normalizedPoints[(i - 1 + normalizedPoints.length) % normalizedPoints.length];
        const next = normalizedPoints[(i + 1) % normalizedPoints.length];
        const cross = (point.x - prev.x) * (next.y - point.y) - (point.y - prev.y) * (next.x - point.x);
        const cornerDirection = cross * winding < 0 ? -1 : 1;
        return Math.max(0, radius + borderDistance * cornerDirection);
      });
      const noCorner = borderCornerRadius.length === 0 || borderCornerRadius.every(r => r === 0);

      context.beginPath();
      if (noCorner) {
        drawPolygon(context.camera ? context : context.nativeContext, borderPoints, x, y);
      } else {
        drawRoundedPolygon(
          context.camera ? context : context.nativeContext,
          borderPoints,
          x,
          y,
          borderCornerRadius,
          closePath
        );
      }
      closePath && context.closePath();

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(polygon, polygon.attribute, polygonAttribute);

      if (strokeCb) {
        strokeCb(context, borderStyle, polygonAttribute[key]);
      } else if (doBorderStroke) {
        // 主题里 border 的默认值不带 opacity，缺了会让 setStrokeStyle 整段空转，与 rect 一样先临时注入
        const lastOpacity = (polygonAttribute[key] as any).opacity;
        (polygonAttribute[key] as any).opacity = opacity;
        context.setStrokeStyle(
          polygon,
          borderStyle,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          polygonAttribute[key] as any
        );
        (polygonAttribute[key] as any).opacity = lastOpacity;
        context.stroke();
      }
    };

    doOuterBorder && renderBorder(outerBorder, 'outerBorder');
    doInnerBorder && renderBorder(innerBorder, 'innerBorder');
  }
}

export const defaultPolygonRenderContribution = new DefaultPolygonRenderContribution();
