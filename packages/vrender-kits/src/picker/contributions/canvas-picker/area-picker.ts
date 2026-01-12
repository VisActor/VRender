import { AreaRender, AREA_NUMBER_TYPE, application } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasAreaPicker extends PickerBase implements IGraphicPicker {
  type: string = 'area';
  numberType: number = AREA_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(AreaRender);
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(AreaRender)[0];
    }
  }
}
