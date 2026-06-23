import { PATH_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathPathPicker extends PickerBase implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
