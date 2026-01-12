import { application, LineRender, LINE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { ILine, IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { BaseLinePicker } from '../common/base-line-picker';

export class DefaultCanvasLinePicker extends BaseLinePicker<ILine> implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor() {
    super();
    const render = application.contributions.get<IGraphicRender>(LineRender)[0];
    this.canvasRenderer = render;
  }
}
