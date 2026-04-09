import { SYMBOL_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathSymbolPicker extends PickerBase implements IGraphicPicker {
  type: string = 'symbol';
  numberType: number = SYMBOL_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
