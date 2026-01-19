import { serviceRegistry, StarRender, STAR_NUMBER_TYPE, contributionRegistry } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasStarPicker extends PickerBase implements IGraphicPicker {
  type: string = 'star';
  numberType: number = STAR_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(StarRender);
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(StarRender)[0];
    }
  }
}
