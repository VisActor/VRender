import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { inject, injectable, named } from '../../../common/inversify-lite';
// eslint-disable-next-line
import { ContributionProvider } from '../../../common/contribution-provider';
import { getTheme } from '../../../graphic/theme';
import { SYMBOL_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ISymbol,
  IThemeAttribute,
  ISymbolRenderContribution,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IContributionProvider
} from '../../../interface';
import type {} from '../../render-service';
import { BaseRender } from './base-render';
import { BaseRenderContributionTime } from '../../../common/enums';
import { SymbolRenderContribution } from './contributions/constants';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import {
  defaultSymbolBackgroundRenderContribution,
  defaultSymbolRenderContribution,
  defaultSymbolTextureRenderContribution
} from './contributions';

@injectable()
export class DefaultCanvasSymbolRender extends BaseRender<ISymbol> implements IGraphicRender {
  type: 'symbol';
  numberType: number = SYMBOL_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(SymbolRenderContribution)
    protected readonly symbolRenderContribitions: IContributionProvider<ISymbolRenderContribution>
  ) {
    super();
    this.builtinContributions = [
      defaultSymbolRenderContribution,
      defaultSymbolBackgroundRenderContribution,
      defaultSymbolTextureRenderContribution
    ];
    this.init(symbolRenderContribitions);
  }

  drawShape(
    symbol: ISymbol,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
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
    // const symbolAttribute = graphicService.themeService.getCurrentTheme().symbolAttribute;
    const symbolAttribute = getTheme(symbol, params?.theme).symbol;

    const {
      size = symbolAttribute.size,
      x: originX = symbolAttribute.x,
      y: originY = symbolAttribute.y,
      scaleX = symbolAttribute.scaleX,
      scaleY = symbolAttribute.scaleY
    } = symbol.attribute;

    const data = this.valid(symbol, symbolAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    const parsedPath = symbol.getParsedPath();
    // todo: 考虑使用path
    if (!parsedPath) {
      return;
    }

    const { keepDirIn3d = symbolAttribute.keepDirIn3d } = symbol.attribute;
    const z = this.z ?? 0;
    context.beginPath();
    if (keepDirIn3d && context.camera && context.project) {
      const p = context.project(x, y, z);
      const camera = context.camera;
      context.camera = null;
      if (
        parsedPath.draw(context, size, p.x, p.y, undefined, (p, a) => {
          if (a.fill) {
            if (fillCb) {
              fillCb(context, symbol.attribute, symbolAttribute);
            } else {
              context.setCommonStyle(symbol, a, originX - x, originY - y);
              context.fill();
            }
          }
          if (a.stroke) {
            if (strokeCb) {
              strokeCb(context, symbol.attribute, symbolAttribute);
            } else {
              context.setStrokeStyle(symbol, a, (originX - x) / scaleX, (originY - y) / scaleY);
              context.stroke();
            }
          }
        }) === false
      ) {
        context.closePath();
      }
      context.camera = camera;
    } else {
      if (
        parsedPath.draw(context, size, x, y, z, (p, a) => {
          if (a.fill) {
            if (fillCb) {
              fillCb(context, symbol.attribute, symbolAttribute);
            } else {
              context.setCommonStyle(symbol, a, originX - x, originY - y);
              context.fill();
            }
          }
          if (a.stroke) {
            if (strokeCb) {
              strokeCb(context, symbol.attribute, symbolAttribute);
            } else {
              context.setStrokeStyle(symbol, a, (originX - x) / scaleX, (originY - y) / scaleY);
              context.stroke();
            }
          }
        }) === false
      ) {
        context.closePath();
      }
    }

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(symbol, symbol.attribute, symbolAttribute);

    this.beforeRenderStep(
      symbol,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      symbolAttribute,
      drawContext,
      fillCb,
      strokeCb
    );

    // if (fill !== false) {
    //   context.setCommonStyle(symbol.attribute, symbolAttribute);
    //   context.fill();
    // }
    // if (stroke !== false) {
    //   context.setStrokeStyle(symbol.attribute, symbolAttribute);
    //   context.stroke();
    // }

    // svg就不用fill和stroke了
    if (doFill && !parsedPath.isSvg) {
      if (fillCb) {
        fillCb(context, symbol.attribute, symbolAttribute);
      } else if (fVisible) {
        context.setCommonStyle(symbol, symbol.attribute, originX - x, originY - y, symbolAttribute);
        context.fill();
      }
    }
    if (doStroke && !parsedPath.isSvg) {
      if (strokeCb) {
        strokeCb(context, symbol.attribute, symbolAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(
          symbol,
          symbol.attribute,
          (originX - x) / scaleX,
          (originY - y) / scaleY,
          symbolAttribute
        );
        context.stroke();
      }
    }

    this.afterRenderStep(
      symbol,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      symbolAttribute,
      drawContext,
      fillCb,
      strokeCb
    );
  }

  draw(symbol: ISymbol, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const symbolAttribute = getTheme(symbol, params?.theme).symbol;
    this._draw(symbol, symbolAttribute, false, drawContext, params);
  }
}
