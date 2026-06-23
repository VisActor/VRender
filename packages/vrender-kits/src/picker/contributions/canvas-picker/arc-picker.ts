import { ARC_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasArcPicker extends PickerBase implements IGraphicPicker {
  type: string = 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
