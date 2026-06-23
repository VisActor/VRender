import { POLYGON_NUMBER_TYPE, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathPolygonPicker extends PickerBase implements IGraphicPicker {
  type: string = 'polygon';
  numberType: number = POLYGON_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
