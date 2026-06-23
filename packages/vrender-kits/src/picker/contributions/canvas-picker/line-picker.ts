import { LINE_NUMBER_TYPE, type ILine, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { BaseLinePicker } from '../common/base-line-picker';

export class DefaultCanvasLinePicker extends BaseLinePicker<ILine> implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
