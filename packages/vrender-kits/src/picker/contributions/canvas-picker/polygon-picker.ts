import { inject, injectable, PolygonRender, POLYGON_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultCanvasPolygonPicker extends PickerBase implements IGraphicPicker {
  type: string = 'polygon';
  numberType: number = POLYGON_NUMBER_TYPE;

  constructor(@inject(PolygonRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
