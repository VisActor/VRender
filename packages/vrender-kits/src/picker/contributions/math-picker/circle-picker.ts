import { CIRCLE_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathCirclePicker extends PickerBase implements IGraphicPicker {
  type: string = 'circle';
  numberType: number = CIRCLE_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
