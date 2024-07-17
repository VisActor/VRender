import { inject, injectable, CircleRender, CIRCLE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultMathCirclePicker extends PickerBase implements IGraphicPicker {
  type: string = 'circle';
  numberType: number = CIRCLE_NUMBER_TYPE;
  constructor(@inject(CircleRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
