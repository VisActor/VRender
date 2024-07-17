import { inject, injectable, CircleRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { CirclePickerBase } from '../common/circle-picker-base';

@injectable()
export class DefaultMathCirclePicker extends CirclePickerBase implements IGraphicPicker {
  constructor(@inject(CircleRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
