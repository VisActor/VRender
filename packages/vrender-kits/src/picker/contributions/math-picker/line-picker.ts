import { LINE_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathLinePicker extends PickerBase implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
  // numberType?: number = LINE_NUMBER_TYPE;
}
