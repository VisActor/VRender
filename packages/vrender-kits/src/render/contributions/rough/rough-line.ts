import type {
  IGraphicRender,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicAttribute,
  ISegPath2D,
  ILine,
  ILineGraphicAttribute,
  IClipRangeByDimensionType,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService
} from '@visactor/vrender-core';
import { DefaultCanvasLineRender, LINE_NUMBER_TYPE } from '@visactor/vrender-core';
import { RoughBaseRender } from './base-render';

export class RoughCanvasLineRender extends RoughBaseRender implements IGraphicRender {
  declare type: 'line';
  declare numberType: number;
  style: 'rough' = 'rough';

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
    this.type = 'line';
    this.numberType = LINE_NUMBER_TYPE;
  }

  draw(line: ILine, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    this.doDraw(line, renderService, drawContext, params);
  }
}
