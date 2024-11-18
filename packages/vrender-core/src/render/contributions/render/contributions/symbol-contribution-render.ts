import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  IThemeAttribute,
  ISymbolRenderContribution,
  IDrawContext,
  IBorderStyle
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
      scaleY = symbolAttribute.scaleY,
      keepStrokeScale = symbolAttribute.keepStrokeScale
    } = symbol.attribute;

    const renderBorder = (borderStyle: Partial<IBorderStyle>, key: 'outerBorder' | 'innerBorder') => {
      const doStroke = !!(borderStyle && borderStyle.stroke);

      const { distance = symbolAttribute[key].distance } = borderStyle;
      const d = keepStrokeScale ? (distance as number) : getScaledStroke(context, distance as number, context.dpr);
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

export const defaultSymbolRenderContribution = new DefaultSymbolRenderContribution();
export const defaultSymbolTextureRenderContribution = defaultBaseTextureRenderContribution;
export const defaultSymbolBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
