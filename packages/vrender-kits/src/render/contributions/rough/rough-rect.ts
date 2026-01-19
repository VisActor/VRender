import {
  type IGraphicRender,
  type IRenderService,
  type IRect,
  type IDrawContext,
  type IGraphicRenderDrawParams,
  RECT_NUMBER_TYPE,
  DefaultCanvasRectRender,
  serviceRegistry,
  contributionRegistry,
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

  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(DefaultCanvasRectRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(DefaultCanvasRectRender)[0];
    }
    this.type = 'rect';
    this.numberType = RECT_NUMBER_TYPE;
  }

  draw(rect: IRect, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    this.doDraw(rect, renderService, drawContext, params);
  }
}
