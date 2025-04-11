import { inject, injectable, StarRender, STAR_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultCanvasStarPicker extends PickerBase implements IGraphicPicker {
  type: string = 'star';
  numberType: number = STAR_NUMBER_TYPE;

  constructor(@inject(StarRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
