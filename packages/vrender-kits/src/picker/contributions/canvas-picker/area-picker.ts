import { serviceRegistry, AreaRender, AREA_NUMBER_TYPE, contributionRegistry } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasAreaPicker extends PickerBase implements IGraphicPicker {
  type: string = 'area';
  numberType: number = AREA_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(AreaRender);
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(AreaRender)[0];
    }
  }
}
