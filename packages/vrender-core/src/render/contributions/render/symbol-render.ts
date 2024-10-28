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
  IContributionProvider,
  ICustomPath2D
} from '../../../interface';
import type {} from '../../render-service';
import { BaseRender } from './base-render';
import { SymbolRenderContribution } from './contributions/constants';
import { isArray } from '@visactor/vutils';
import {
  defaultSymbolBackgroundRenderContribution,
  defaultSymbolClipRangeStrokeRenderContribution,
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
      defaultSymbolTextureRenderContribution,
      defaultSymbolClipRangeStrokeRenderContribution
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
      scaleY = symbolAttribute.scaleY,
      fillStrokeOrder = symbolAttribute.fillStrokeOrder,
      clipRange = symbolAttribute.clipRange
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

    const callback = (p: ICustomPath2D, a: any) => {
      // 如果是svg的话，合并一下fill和stroke
      if (symbol._parsedPath.svgCache) {
        const obj = Object.assign({}, a);
        obj.fill = a.fill ?? symbol.attribute.fill;
        obj.opacity = a.opacity ?? symbol.attribute.opacity;
        obj.fillOpacity = symbol.attribute.fillOpacity;
        obj.stroke = a.stroke ?? symbol.attribute.stroke;
        obj.lineWidth = a.lineWidth ?? symbol.attribute.lineWidth;
        a = obj;
      }
      const _runFill = () => {
        if (a.fill) {
          if (fillCb) {
            fillCb(context, symbol.attribute, symbolAttribute);
          } else {
            context.setCommonStyle(symbol, a, originX - x, originY - y, symbolAttribute);
            context.fill();
          }
        }
      };
      const _runStroke = () => {
        if (a.stroke) {
          if (strokeCb) {
            strokeCb(context, symbol.attribute, symbolAttribute);
          } else if (sVisible && clipRange >= 1) {
            context.setStrokeStyle(symbol, a, (originX - x) / scaleX, (originY - y) / scaleY, symbolAttribute);
            context.stroke();
          }
        }
      };
      if (!fillStrokeOrder) {
        _runFill();
        _runStroke();
      } else {
        _runStroke();
        _runFill();
      }
    };
    let _size = size;
    let _x = x;
    let _y = y;
    let _z = z;
    const camera = context.camera;
    if (keepDirIn3d && camera && context.project) {
      const p = context.project(x, y, z);
      context.camera = null;
      _size = isArray(size) ? [size[0] * scaleX, size[1] * scaleY] : size * scaleX;
      _x = p.x;
      _y = p.y;
      _z = undefined;
    }
    if (parsedPath.draw(context, size, x, y, z, callback) === false) {
      context.closePath();
    }
    if (keepDirIn3d && context.camera && context.project) {
      context.camera = camera;
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
    const _runFill = () => {
      if (doFill && !parsedPath.isSvg) {
        if (fillCb) {
          fillCb(context, symbol.attribute, symbolAttribute);
        } else if (fVisible) {
          context.setCommonStyle(symbol, symbol.attribute, originX - x, originY - y, symbolAttribute);
          context.fill();
        }
      }
    };
    const _runStroke = () => {
      if (doStroke && !parsedPath.isSvg) {
        if (strokeCb) {
          strokeCb(context, symbol.attribute, symbolAttribute);
        } else if (sVisible && clipRange >= 1) {
          // 如果clipRange < 1，就需要靠afterRender进行绘制了
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
    };

    if (!fillStrokeOrder) {
      _runFill();
      _runStroke();
    } else {
      _runStroke();
      _runFill();
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
