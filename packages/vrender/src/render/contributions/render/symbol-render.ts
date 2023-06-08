import { mat4Allocate } from '../../../modules';
import { inject, injectable, named } from 'inversify';
import type { ContributionProvider } from '../../../common/contribution-provider';
import { SYMBOL_NUMBER_TYPE } from '../../../graphic/symbol';
import { getTheme } from '../../../graphic/theme';
import type { IGraphicAttribute, IContext2d, IMarkAttribute, ISymbol, IThemeAttribute } from '../../../interface';
import type { IDrawContext, IRenderService } from '../../render-service';
import { BaseRender } from './base-render';
import { BaseRenderContributionTime } from './contributions/base-contribution-render';
import type { ISymbolRenderContribution } from './contributions/symbol-contribution-render';
import { SymbolRenderContribution } from './contributions/symbol-contribution-render';
import type { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';

@injectable()
export class DefaultCanvasSymbolRender extends BaseRender<ISymbol> implements IGraphicRender {
  type: 'symbol';
  numberType: number = SYMBOL_NUMBER_TYPE;
  declare z: number;

  protected _symbolRenderContribitions: ISymbolRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(SymbolRenderContribution)
    protected readonly symbolRenderContribitions: ContributionProvider<ISymbolRenderContribution>
  ) {
    super();
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
      fill = symbolAttribute.fill,
      background,
      fillOpacity = symbolAttribute.fillOpacity,
      strokeOpacity = symbolAttribute.strokeOpacity,
      opacity = symbolAttribute.opacity,
      lineWidth = symbolAttribute.lineWidth,
      stroke = symbolAttribute.stroke,
      visible = symbolAttribute.visible
    } = symbol.attribute;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(symbol.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke || background)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
      return;
    }

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
      if (parsedPath.draw(context, size, p.x, p.y) === false) {
        context.closePath();
      }
      context.camera = camera;
    } else {
      if (parsedPath.draw(context, size, x, y, z) === false) {
        context.closePath();
      }
    }

    if (!this._symbolRenderContribitions) {
      this._symbolRenderContribitions = this.symbolRenderContribitions.getContributions() || [];
      this._symbolRenderContribitions.sort((a, b) => b.order - a.order);
    }
    this._symbolRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(symbol, symbol.attribute, x, y, symbolAttribute);
        c.drawShape(symbol, context, x, y, doFill, doStroke, fVisible, sVisible, symbolAttribute, fillCb, strokeCb);
      }
    });

    // if (fill !== false) {
    //   context.setCommonStyle(symbol.attribute, symbolAttribute);
    //   context.fill();
    // }
    // if (stroke !== false) {
    //   context.setStrokeStyle(symbol.attribute, symbolAttribute);
    //   context.stroke();
    // }

    // shadow
    context.setShadowStyle && context.setShadowStyle(symbol, symbol.attribute, symbolAttribute);

    if (doFill) {
      if (fillCb) {
        fillCb(context, symbol.attribute, symbolAttribute);
      } else if (fVisible) {
        context.setCommonStyle(symbol, symbol.attribute, x, y, symbolAttribute);
        context.fill();
      }
    }
    if (doStroke) {
      if (strokeCb) {
        strokeCb(context, symbol.attribute, symbolAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(symbol, symbol.attribute, x, y, symbolAttribute);
        context.stroke();
      }
    }

    this._symbolRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        c.drawShape(symbol, context, x, y, doFill, doStroke, fVisible, sVisible, symbolAttribute, fillCb, strokeCb);
      }
    });
  }

  draw(symbol: ISymbol, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    // const symbolAttribute = graphicService.themeService.getCurrentTheme().symbolAttribute;
    const symbolAttribute = getTheme(symbol, params?.theme).symbol;
    // let { x = symbolAttribute.x, y = symbolAttribute.y } = symbol.attribute;

    // const transMatrix = symbol.transMatrix;
    // const onlyTranslate = transMatrix.onlyTranslate();
    // // 只有translate，那么不设置矩阵，通过xy进行偏移
    // if (onlyTranslate) {
    //   const point = symbol.getOffsetXY(symbolAttribute);
    //   x += point.x;
    //   y += point.y;
    //   // 当前context有rotate/scale，重置matrix
    //   context.setTransformForCurrent();
    // } else {
    //   // 如果存在translate，那么存在三种情况：不需要设置2d矩阵，需要设置2d矩阵，需要修改2d矩阵然后设置
    //   // 1. 如果通过3d变换绘制，那么也不需要设置矩阵
    //   // 2. 如果缩放等操作依然通过

    //   const { keepDirIn3d = symbolAttribute.keepDirIn3d, scaleX, scaleY, z } = symbol.attribute;
    //   if (context.camera && context.project) {
    //     // 如果保持3d视角，那么需要设置2d矩阵，但是需要进行修改，因为通过投影改变位置，但是需要进行2d缩放和旋转变换
    //     if (keepDirIn3d) {
    //       const p = context.project(x, y, z);
    //       context.translate(p.x, p.y, false);
    //       context.scale(scaleX, scaleY, false);
    //       context.rotate(scaleX, false)
    //       context.translate(-p.x, -p.y, false);
    //       context.setTransformForCurrent();
    //     } else { // 不保持3d视角，所有变换均通过3d矩阵完成，不需要2d的矩阵
    //       context.setTransform(1, 0, 0, 1, 0, 0, true);
    //     }
    //   } else {
    //     // 直接设置矩阵即可
    //     // 性能较差
    //     x = 0;
    //     y = 0;
    //     context.transformFromMatrix(symbol.transMatrix, true);
    //   }
    // }

    const data = this.transform(symbol, symbolAttribute, context);
    const { x, y, z, lastModelMatrix } = data;

    this.z = z;
    if (drawPathProxy(symbol, context, x, y, drawContext, params)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(symbol, context, x, y, drawContext, params);
    this.z = 0;

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    context.highPerformanceRestore();
  }
}
