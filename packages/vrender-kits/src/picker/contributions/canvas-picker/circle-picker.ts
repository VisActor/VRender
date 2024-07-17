import { inject, injectable, CircleRender, CIRCLE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { CirclePickerBase } from '../common/circle-picker-base';

@injectable()
export class DefaultCanvasCirclePicker extends CirclePickerBase implements IGraphicPicker {
  constructor(@inject(CircleRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
