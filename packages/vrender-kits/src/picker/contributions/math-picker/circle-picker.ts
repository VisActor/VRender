import { application, CircleRender, CIRCLE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathCirclePicker extends PickerBase implements IGraphicPicker {
  type: string = 'circle';
  numberType: number = CIRCLE_NUMBER_TYPE;
  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(CircleRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(CircleRender)[0];
    }
  }
}
