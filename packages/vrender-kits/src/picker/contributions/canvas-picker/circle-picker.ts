import { serviceRegistry, CircleRender, CIRCLE_NUMBER_TYPE, contributionRegistry } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasCirclePicker extends PickerBase implements IGraphicPicker {
  type: string = 'circle';
  numberType: number = CIRCLE_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(CircleRender);
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(CircleRender)[0];
    }
  }
}
