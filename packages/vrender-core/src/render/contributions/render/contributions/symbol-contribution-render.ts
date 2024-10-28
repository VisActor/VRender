import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  IThemeAttribute,
  ISymbolRenderContribution,
  IDrawContext,
  IBorderStyle,
  IBaseRenderContribution,
  ICustomPath2D
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import { defaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { defaultBaseTextureRenderContribution } from './base-texture-contribution-render';

export class DefaultSymbolRenderContribution implements ISymbolRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    symbol: ISymbol,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    symbolAttribute: Required<ISymbolGraphicAttribute>,
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
    const parsedPath = symbol.getParsedPath();
    // todo: 考虑使用path
    if (!parsedPath) {
      return;
    }

    const { outerBorder, innerBorder } = symbol.attribute;
    const doOuterBorder = outerBorder && outerBorder.visible !== false;
    const doInnerBorder = innerBorder && innerBorder.visible !== false;
    if (!(doOuterBorder || doInnerBorder)) {
      return;
    }

    const {
      size = symbolAttribute.size,
      opacity = symbolAttribute.opacity,
      x: originX = symbolAttribute.x,
      y: originY = symbolAttribute.y,
      scaleX = symbolAttribute.scaleX,
      scaleY = symbolAttribute.scaleY
    } = symbol.attribute;

    const renderBorder = (borderStyle: Partial<IBorderStyle>, key: 'outerBorder' | 'innerBorder') => {
      const doStroke = !!(borderStyle && borderStyle.stroke);

      const { distance = symbolAttribute[key].distance } = borderStyle;
      const d = getScaledStroke(context, distance as number, context.dpr);
      const sign = key === 'outerBorder' ? 1 : -1;

      context.beginPath();
      if (parsedPath.drawOffset(context, size, x, y, sign * d) === false) {
        context.closePath();
      }

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(symbol, symbol.attribute, symbolAttribute);

      if (strokeCb) {
        strokeCb(context, borderStyle, symbolAttribute[key]);
      } else if (doStroke) {
        // 存在stroke
        const lastOpacity = (symbolAttribute[key] as any).opacity;
        (symbolAttribute[key] as any).opacity = opacity;
        context.setStrokeStyle(
          symbol,
          borderStyle,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          symbolAttribute[key] as any
        );
        (symbolAttribute[key] as any).opacity = lastOpacity;
        context.stroke();
      }
    };

    doOuterBorder && renderBorder(outerBorder, 'outerBorder');
    doInnerBorder && renderBorder(innerBorder, 'innerBorder');
  }
}

export class DefaultSymbolClipRangeStrokeRenderContribution
  implements IBaseRenderContribution<ISymbol, ISymbolGraphicAttribute>
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;

  drawShape(
    graphic: ISymbol,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<ISymbolGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    options?: any
  ) {
    const {
      clipRange = graphicAttribute.clipRange,
      x: originX = graphicAttribute.x,
      y: originY = graphicAttribute.y,
      z = graphicAttribute.z,
      size = graphicAttribute.size,
      scaleX = graphicAttribute.scaleX,
      scaleY = graphicAttribute.scaleY
    } = graphic.attribute;
    const parsedPath = graphic.getParsedPath();
    // todo: 考虑使用path
    if (!(parsedPath && clipRange < 1 && clipRange > 0)) {
      return;
    }

    const callback = (p: ICustomPath2D, a: any) => {
      // 如果是svg的话，合并一下fill和stroke
      if (graphic._parsedPath.svgCache) {
        const obj = Object.assign({}, a);
        obj.fill = a.fill ?? graphic.attribute.fill;
        obj.opacity = a.opacity ?? graphic.attribute.opacity;
        obj.fillOpacity = graphic.attribute.fillOpacity;
        obj.stroke = a.stroke ?? graphic.attribute.stroke;
        obj.lineWidth = a.lineWidth ?? graphic.attribute.lineWidth;
        a = obj;
      }

      if (a.stroke) {
        if (strokeCb) {
          strokeCb(context, graphic.attribute, graphicAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(graphic, a, (originX - x) / scaleX, (originY - y) / scaleY, graphicAttribute);
          context.stroke();
        }
      }
    };

    context.beginPath();
    parsedPath.drawWithClipRange && parsedPath.drawWithClipRange(context, size, x, y, clipRange, z, callback);

    if (doStroke && !parsedPath.isSvg) {
      if (strokeCb) {
        strokeCb(context, graphic.attribute, graphicAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(
          graphic,
          graphic.attribute,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          graphicAttribute
        );
        context.stroke();
      }
    }
  }
}

export const defaultSymbolRenderContribution = new DefaultSymbolRenderContribution();
export const defaultSymbolClipRangeStrokeRenderContribution = new DefaultSymbolClipRangeStrokeRenderContribution();
export const defaultSymbolTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultSymbolBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
