import { STAR_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasStarPicker extends PickerBase implements IGraphicPicker {
  type: string = 'star';
  numberType: number = STAR_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
