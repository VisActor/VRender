import type {
  IGraphicRender,
  IRenderService,
  ISymbol,
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IMarkAttribute,
  IThemeAttribute,
  IDrawContext,
  IGraphicRenderDrawParams
} from '@visactor/vrender-core';
import {
  SYMBOL_NUMBER_TYPE,
  DefaultCanvasSymbolRender,
  BaseRender,
  getTheme,
  CustomPath2D,
  inject,
  injectable
} from '@visactor/vrender-core';
import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';
import { RoughContext2d } from './context';
import { RoughBaseRender } from './base-render';

@injectable()
export class RoughCanvasSymbolRender extends RoughBaseRender implements IGraphicRender {
  type: 'symbol';
  numberType: number;
  style: 'rough';

  constructor(
    @inject(DefaultCanvasSymbolRender)
    public readonly canvasRenderer: IGraphicRender
  ) {
    super();
    this.type = 'symbol';
    this.numberType = SYMBOL_NUMBER_TYPE;
    this.style = 'rough';
  }

  draw(symbol: ISymbol, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    this.doDraw(symbol, renderService, drawContext, params);
  }
}
