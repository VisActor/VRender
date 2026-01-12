import { StarRender, STAR_NUMBER_TYPE, application } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasStarPicker extends PickerBase implements IGraphicPicker {
  type: string = 'star';
  numberType: number = STAR_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(StarRender);
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(StarRender)[0];
    }
  }
}
