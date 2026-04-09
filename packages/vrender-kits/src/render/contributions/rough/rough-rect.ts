import {
  type IGraphicRender,
  type IRenderService,
  type IRect,
  type IDrawContext,
  type IGraphicRenderDrawParams,
  RECT_NUMBER_TYPE,
  DefaultCanvasRectRender,
  CustomPath2D
} from '@visactor/vrender-core';

import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';
import { RoughBaseRender } from './base-render';
import { RoughContext2d } from './context';

export class RoughCanvasRectRender extends RoughBaseRender implements IGraphicRender {
  type: 'rect';
  numberType: number;
  style: 'rough' = 'rough';

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
    this.type = 'rect';
    this.numberType = RECT_NUMBER_TYPE;
  }

  draw(rect: IRect, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    this.doDraw(rect, renderService, drawContext, params);
  }
}
