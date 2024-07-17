import { inject, injectable, ArcRender, ARC_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultCanvasArcPicker extends PickerBase implements IGraphicPicker {
  type: string = 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor(@inject(ArcRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
