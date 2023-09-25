import { injectable } from '../../../../common/inversify-lite';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  IThemeAttribute,
  ISymbolRenderContribution,
  IDrawContext
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import {
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

@injectable()
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

    const doStrokeOuter = !!(outerBorder && outerBorder.stroke);
    const doStrokeInner = !!(innerBorder && innerBorder.stroke);

    if (doOuterBorder) {
      const { distance = symbolAttribute.outerBorder.distance } = outerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);

      context.beginPath();
      if (parsedPath.drawOffset(context, size, x, y, d) === false) {
        context.closePath();
      }

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(symbol, symbol.attribute, symbolAttribute);

      if (strokeCb) {
        strokeCb(context, outerBorder, symbolAttribute.outerBorder);
      } else if (doStrokeOuter) {
        // 存在stroke
        const lastOpacity = (symbolAttribute.outerBorder as any).opacity;
        (symbolAttribute.outerBorder as any).opacity = opacity;
        context.setStrokeStyle(
          symbol,
          outerBorder,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          symbolAttribute.outerBorder as any
        );
        (symbolAttribute.outerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }

    if (doInnerBorder) {
      const { distance = symbolAttribute.innerBorder.distance } = innerBorder;
      const d = getScaledStroke(context, distance as number, context.dpr);

      context.beginPath();
      if (parsedPath.drawOffset(context, size, x, y, -d) === false) {
        context.closePath();
      }

      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(symbol, symbol.attribute, symbolAttribute);

      if (strokeCb) {
        strokeCb(context, innerBorder, symbolAttribute.innerBorder);
      } else if (doStrokeInner) {
        // 存在stroke
        const lastOpacity = (symbolAttribute.innerBorder as any).opacity;
        (symbolAttribute.innerBorder as any).opacity = opacity;
        context.setStrokeStyle(
          symbol,
          innerBorder,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          symbolAttribute.innerBorder as any
        );
        (symbolAttribute.innerBorder as any).opacity = lastOpacity;
        context.stroke();
      }
    }
  }
}

export class DefaultSymbolBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements ISymbolRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
}

export class DefaultSymbolTextureRenderContribution
  extends DefaultBaseTextureRenderContribution
  implements ISymbolRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
}
